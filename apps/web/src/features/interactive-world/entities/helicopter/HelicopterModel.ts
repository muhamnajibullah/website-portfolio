import {
  BoxGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  SphereGeometry,
  CylinderGeometry,
} from 'three';
export function createHelicopter() {
  const group = new Group();
  const paint = new MeshStandardMaterial({ color: '#59799b', roughness: 0.85 });
  const window = new MeshStandardMaterial({ color: '#bad9e5', roughness: 0.5 });
  const dark = new MeshStandardMaterial({ color: '#3c5366', roughness: 0.85 });
  const body = new Mesh(new SphereGeometry(1, 12, 8), paint);
  body.scale.set(0.75, 0.68, 1.35);
  group.add(body);
  const glass = new Mesh(new SphereGeometry(0.7, 10, 6), window);
  glass.scale.set(0.88, 0.65, 0.95);
  glass.position.set(0, 0.12, -0.78);
  group.add(glass);
  const tail = new Mesh(new BoxGeometry(0.18, 0.22, 2.2), paint);
  tail.position.set(0, 0.2, 1.9);
  group.add(tail);
  const fin = new Mesh(new BoxGeometry(0.12, 0.85, 0.55), paint);
  fin.position.set(0, 0.6, 2.9);
  group.add(fin);
  for (const x of [-0.7, 0.7]) {
    const skid = new Mesh(new BoxGeometry(0.12, 0.12, 2.25), dark);
    skid.position.set(x, -0.85, 0);
    group.add(skid);
    for (const z of [-0.6, 0.6]) {
      const support = new Mesh(new BoxGeometry(0.1, 0.35, 0.1), dark);
      support.position.set(x, -0.65, z);
      group.add(support);
    }
  }
  const mast = new Mesh(new CylinderGeometry(0.07, 0.07, 0.5, 6), dark);
  mast.position.y = 0.87;
  group.add(mast);
  const rotor = new Mesh(new BoxGeometry(4.8, 0.035, 0.18), dark);
  rotor.position.y = 1.15;
  group.add(rotor);
  const tailRotor = new Mesh(new BoxGeometry(0.045, 1.1, 0.1), dark);
  tailRotor.position.set(0.15, 0.45, 2.9);
  group.add(tailRotor);
  return { group, rotor, tailRotor };
}
