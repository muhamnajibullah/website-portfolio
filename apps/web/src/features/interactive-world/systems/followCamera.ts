import type { Vec3 } from './flightMovement';
export function followTarget(position: Vec3, yaw: number, orbit: number, pitch: number): Vec3 {
  const angle = yaw + orbit;
  return {
    x: position.x + Math.sin(angle) * 10,
    y: position.y + 4 + pitch * 5,
    z: position.z + Math.cos(angle) * 10,
  };
}
export function smoothVector(current: Vec3, target: Vec3, delta: number, reducedMotion: boolean) {
  const amount = 1 - Math.exp(-(reducedMotion ? 12 : 5) * Math.min(delta, 0.05));
  current.x += (target.x - current.x) * amount;
  current.y += (target.y - current.y) * amount;
  current.z += (target.z - current.z) * amount;
}
