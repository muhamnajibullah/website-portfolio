import { Box3, LoadingManager, Mesh, Texture, Vector3, type Object3D } from 'three';

export function disposeObject(object: Object3D) {
  object.traverse((node) => {
    if (!(node instanceof Mesh)) return;
    node.geometry.dispose();
    for (const material of Array.isArray(node.material) ? node.material : [node.material]) {
      for (const value of Object.values(material)) if (value instanceof Texture) value.dispose();
      material.dispose();
    }
  });
}
export async function loadHelicopterAsset(path: string) {
  if (!/^\/assets\/[a-zA-Z0-9/_-]+\.(glb|gltf)$/.test(path))
    throw new Error('Use a controlled local GLB/GLTF asset path.');
  const response = await fetch(path);
  if (!response.ok) throw new Error('Helicopter asset is unavailable.');
  const bytes = await response.arrayBuffer();
  if (bytes.byteLength > 5 * 1024 * 1024)
    throw new Error('Helicopter asset exceeds the 5 MB budget.');
  const manager = new LoadingManager();
  manager.setURLModifier((value) => {
    if (value.startsWith('data:') || value.startsWith('blob:')) return value;
    const url = new URL(value, location.origin);
    if (url.origin !== location.origin || !url.pathname.startsWith('/assets/'))
      throw new Error('Asset references must stay within controlled project assets.');
    return url.href;
  });
  const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js');
  const loader = new GLTFLoader(manager);
  const gltf = await loader.parseAsync(
    path.endsWith('.gltf') ? new TextDecoder().decode(bytes) : bytes,
    path.slice(0, path.lastIndexOf('/') + 1),
  );
  const bounds = new Box3().setFromObject(gltf.scene),
    size = bounds.getSize(new Vector3()),
    center = bounds.getCenter(new Vector3());
  const scale = 4 / Math.max(size.x, size.y, size.z, 0.01);
  gltf.scene.position.sub(center);
  gltf.scene.scale.setScalar(scale);
  gltf.scene.position.multiplyScalar(scale);
  return gltf.scene;
}
