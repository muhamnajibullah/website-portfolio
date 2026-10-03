import {
  AmbientLight,
  BoxGeometry,
  Color,
  CylinderGeometry,
  DirectionalLight,
  Fog,
  Group,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  Scene,
  Texture,
  Vector3,
  WebGLRenderer,
  type Material,
  type BufferGeometry,
} from 'three';
import type { InteractivePoint } from '@portfolio/types';
import { createHelicopter } from '../entities/helicopter/HelicopterModel';
import { rotorAngle } from '../entities/helicopter/RotorAnimation';
import { createFlightState, updateFlight, type FlightInput } from '../systems/flightMovement';
import { followTarget, smoothVector } from '../systems/followCamera';
import { nearestPoint, proximity } from '../systems/proximitySystem';
import { desktopFlightControls } from '../controls/desktopFlightControls';
import { disposeObject, loadHelicopterAsset } from '../assets/loadHelicopterAsset';

export type WorldSettings = {
  quality: 'auto' | 'low' | 'medium' | 'high';
  sensitivity: number;
  paused: boolean;
};
export function createWorld({
  host,
  input,
  points,
  labels,
  settings,
  onProximity,
  interact,
  onFailure,
}: {
  host: HTMLElement;
  input: FlightInput;
  points: InteractivePoint[];
  labels: Map<string, HTMLElement>;
  settings: WorldSettings;
  onProximity: (value: ReturnType<typeof nearestPoint>) => void;
  interact: () => void;
  onFailure: () => void;
}) {
  const renderer = new WebGLRenderer({
    antialias: false,
    alpha: false,
    powerPreference: 'low-power',
  });
  const scene = new Scene();
  scene.background = new Color('#e4edf0');
  scene.fog = new Fog('#e4edf0', 35, 105);
  const camera = new PerspectiveCamera(52, 1, 0.1, 140);
  scene.add(new AmbientLight('#ffffff', 2));
  const sun = new DirectionalLight('#fff9ee', 2.2);
  sun.position.set(15, 28, 10);
  scene.add(sun);
  const green = new MeshStandardMaterial({ color: '#c6d8ce', roughness: 1 });
  const concrete = new MeshStandardMaterial({ color: '#f0f2ed', roughness: 1 });
  const island = new Mesh(new CylinderGeometry(58, 55, 2, 48), green);
  island.position.y = -1.5;
  scene.add(island);
  const pad = new Mesh(new CylinderGeometry(5, 5, 0.15, 24), concrete);
  pad.position.set(0, -0.42, 12);
  scene.add(pad);
  const hMaterial = new MeshStandardMaterial({ color: '#819b90' });
  for (const x of [-1, 1]) {
    const stripe = new Mesh(new BoxGeometry(0.35, 0.02, 3), hMaterial);
    stripe.position.set(x, -0.33, 12);
    scene.add(stripe);
  }
  const cross = new Mesh(new BoxGeometry(2, 0.02, 0.35), hMaterial);
  cross.position.set(0, -0.33, 12);
  scene.add(cross);
  const pointGroups = new Map<string, Group>();
  const pointGeometry = new CylinderGeometry(0.55, 0.55, 0.25, 12);
  const projectMaterial = new MeshStandardMaterial({ color: '#6d8fac', roughness: 0.8 });
  const experienceMaterial = new MeshStandardMaterial({ color: '#7b9b8b', roughness: 0.8 });
  for (const point of points) {
    const group = new Group();
    group.position.set(point.x, 0, point.z);
    group.rotation.y = point.rotation;
    const pedestal = new Mesh(new BoxGeometry(3.6, 0.8, 3.6), concrete);
    pedestal.position.y = 0;
    group.add(pedestal);
    const building = new Mesh(
      new BoxGeometry(2.2, 1.2, 2.2),
      point.project_id ? projectMaterial : experienceMaterial,
    );
    building.position.y = 1;
    group.add(building);
    const marker = new Mesh(pointGeometry, point.project_id ? projectMaterial : experienceMaterial);
    marker.position.y = point.y + 1;
    group.add(marker);
    scene.add(group);
    pointGroups.set(point.id, group);
  }
  const helicopter = createHelicopter();
  scene.add(helicopter.group);
  let state = createFlightState(),
    disposed = false;
  let assetRotor: Group | Mesh | null = null;
  const assetPath: unknown = import.meta.env.VITE_HELICOPTER_MODEL_PATH;
  if (typeof assetPath === 'string' && assetPath) {
    void loadHelicopterAsset(assetPath)
      .then((model) => {
        if (disposed) {
          disposeObject(model);
          return;
        }
        helicopter.group.children.forEach((child) => {
          child.visible = false;
        });
        helicopter.group.add(model);
        const rotor = model.getObjectByName('MainRotor');
        assetRotor = rotor instanceof Group || rotor instanceof Mesh ? rotor : null;
      })
      .catch(() => {
        /* Keep the lightweight development helicopter when a model fails. */
      });
  }
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = window.matchMedia('(pointer: coarse)').matches;
  let autoDpr = mobile ? 0.85 : Math.min(window.devicePixelRatio, 1.5);
  let currentDpr = 0,
    previousQuality = '';
  const applyDpr = () => {
    const ratio =
      settings.quality === 'auto'
        ? autoDpr
        : { low: 0.75, medium: 1, high: Math.min(1.75, window.devicePixelRatio) }[settings.quality];
    if (currentDpr !== ratio || previousQuality !== settings.quality) {
      currentDpr = ratio;
      previousQuality = settings.quality;
      renderer.setPixelRatio(ratio);
      resize();
    }
  };
  const resize = () => {
    const width = host.clientWidth,
      height = host.clientHeight;
    if (!width || !height) return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  };
  const reset = () => {
    state = createFlightState();
    input.orbit = 0;
    input.pitch = 0.25;
    input.forward = 0;
    input.turn = 0;
    input.altitude = 0;
    previousProximity = 'reset';
  };
  const initialCamera = followTarget(state.position, state.yaw, 0, 0.25);
  camera.position.set(initialCamera.x, initialCamera.y, initialCamera.z);
  const look = new Vector3(0, 3.4, 12),
    projected = new Vector3();
  const controlsCleanup = desktopFlightControls(
    renderer.domElement,
    input,
    interact,
    reset,
    () => settings.sensitivity,
  );
  renderer.domElement.setAttribute(
    'aria-label',
    'Helicopter world. Drag to look. Use WASD to move and arrows to change altitude.',
  );
  renderer.domElement.setAttribute('role', 'img');
  renderer.domElement.style.touchAction = 'none';
  host.appendChild(renderer.domElement);
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  applyDpr();
  let previous = performance.now(),
    uiElapsed = 0,
    frameTime = 16,
    qualityElapsed = 0;
  let previousProximity = '';
  const loseContext = (event: Event) => {
    event.preventDefault();
    onFailure();
  };
  renderer.domElement.addEventListener('webglcontextlost', loseContext);
  const frame = (now: number) => {
    if (disposed) return;
    const rawDelta = (now - previous) / 1000;
    previous = now;
    if (document.hidden || settings.paused) return;
    const delta = Math.min(rawDelta, 0.05);
    updateFlight(state, input, delta);
    helicopter.group.position.set(state.position.x, state.position.y, state.position.z);
    helicopter.group.rotation.y = state.yaw;
    helicopter.rotor.rotation.y = rotorAngle(helicopter.rotor.rotation.y, delta, reduced.matches);
    helicopter.tailRotor.rotation.x = rotorAngle(
      helicopter.tailRotor.rotation.x,
      delta,
      reduced.matches,
    );
    if (assetRotor)
      assetRotor.rotation.y = rotorAngle(assetRotor.rotation.y, delta, reduced.matches);
    smoothVector(
      camera.position,
      followTarget(state.position, state.yaw, input.orbit, input.pitch),
      delta,
      reduced.matches,
    );
    smoothVector(look, { ...state.position, y: state.position.y + 0.4 }, delta, reduced.matches);
    camera.lookAt(look);
    uiElapsed += delta;
    if (uiElapsed > 0.15) {
      uiElapsed = 0;
      renderer.domElement.dataset.flight = JSON.stringify({
        position: state.position,
        forward: input.forward,
        turn: input.turn,
        altitude: input.altitude,
      });
      const nearest = nearestPoint(state.position, points);
      const signature = `${nearest?.point.id ?? ''}:${nearest?.zone ?? ''}`;
      if (signature !== previousProximity) {
        previousProximity = signature;
        onProximity(nearest);
      }
    }
    // Labels follow the scene through DOM writes; React only updates on zone transitions.
    for (const point of points) {
      const label = labels.get(point.id),
        group = pointGroups.get(point.id);
      if (!label || !group) continue;
      const zone = proximity(state.position, point).zone;
      projected.set(point.x, point.y + 2.2, point.z).project(camera);
      const visible =
        zone !== 'outside' &&
        projected.z < 1 &&
        projected.z > -1 &&
        Math.abs(projected.x) < 1 &&
        Math.abs(projected.y) < 1;
      label.style.display = visible ? 'block' : 'none';
      label.style.transform = `translate(${(projected.x * 0.5 + 0.5) * host.clientWidth}px,${(-projected.y * 0.5 + 0.5) * host.clientHeight}px) translate(-50%,-100%)`;
      label.dataset.zone = zone;
    }
    frameTime += (Math.min(rawDelta * 1000, 250) - frameTime) * 0.1;
    qualityElapsed += Math.min(rawDelta, 1);
    if (qualityElapsed > 2) {
      qualityElapsed = 0;
      if (settings.quality === 'auto' && frameTime > 32) autoDpr = Math.max(0.65, autoDpr - 0.2);
    }
    applyDpr();
    renderer.render(scene, camera);
  };
  const renderFrame = (now: number) => {
    try {
      frame(now);
    } catch {
      renderer.setAnimationLoop(null);
      onFailure();
    }
  };
  renderer.setAnimationLoop(renderFrame);
  const visibility = () => {
    input.forward = 0;
    input.turn = 0;
    input.altitude = 0;
    // Stop the renderer's animation callbacks while the browser tab is hidden.
    if (document.hidden) renderer.setAnimationLoop(null);
    else {
      previous = performance.now();
      renderer.setAnimationLoop(renderFrame);
    }
  };
  document.addEventListener('visibilitychange', visibility);
  return {
    reset,
    dispose() {
      if (disposed) return;
      disposed = true;
      renderer.setAnimationLoop(null);
      controlsCleanup();
      observer.disconnect();
      document.removeEventListener('visibilitychange', visibility);
      renderer.domElement.removeEventListener('webglcontextlost', loseContext);
      const geometries = new Set<BufferGeometry>(),
        materials = new Set<Material>();
      scene.traverse((object) => {
        if (object instanceof Mesh) {
          geometries.add(object.geometry);
          for (const material of Array.isArray(object.material)
            ? object.material
            : [object.material])
            materials.add(material);
        }
      });
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => {
        for (const value of Object.values(material)) if (value instanceof Texture) value.dispose();
        material.dispose();
      });
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    },
  };
}
