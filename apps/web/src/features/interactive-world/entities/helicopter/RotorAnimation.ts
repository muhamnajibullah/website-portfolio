export function rotorAngle(current: number, delta: number, reducedMotion: boolean) {
  return reducedMotion ? current : (current + delta * 7) % (Math.PI * 2);
}
