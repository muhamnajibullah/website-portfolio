import type { InteractivePoint } from '@portfolio/types';
import type { Vec3 } from './flightMovement';
export type ProximityZone = 'outside' | 'discovery' | 'focus' | 'interaction';
export function proximity(
  position: Vec3,
  point: InteractivePoint,
): { zone: ProximityZone; distance: number } {
  const distance = Math.hypot(position.x - point.x, position.y - point.y, position.z - point.z);
  return {
    distance,
    zone: !point.enabled
      ? 'outside'
      : distance <= point.interaction_radius
        ? 'interaction'
        : distance <= point.focus_radius
          ? 'focus'
          : distance <= point.discovery_radius
            ? 'discovery'
            : 'outside',
  };
}
export function nearestPoint(position: Vec3, points: InteractivePoint[]) {
  return (
    points
      .map((point) => ({ point, ...proximity(position, point) }))
      .filter((result) => result.zone !== 'outside')
      .sort((a, b) => a.distance - b.distance)[0] ?? null
  );
}
