export type Vec3 = { x: number; y: number; z: number };
export type FlightState = { position: Vec3; velocity: Vec3; yaw: number };
export type FlightInput = {
  forward: number;
  turn: number;
  altitude: number;
  orbit: number;
  pitch: number;
};
export const createFlightState = (): FlightState => ({
  position: { x: 0, y: 3, z: 12 },
  velocity: { x: 0, y: 0, z: 0 },
  yaw: 0,
});
export const createFlightInput = (): FlightInput => ({
  forward: 0,
  turn: 0,
  altitude: 0,
  orbit: 0,
  pitch: 0.25,
});
export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));
export function updateFlight(state: FlightState, input: FlightInput, delta: number) {
  const dt = clamp(delta, 0, 0.05);
  state.yaw += clamp(input.turn, -1, 1) * 1.25 * dt;
  const forward = clamp(input.forward, -1, 1) * 7;
  const blend = 1 - Math.exp(-4 * dt);
  state.velocity.x += (-Math.sin(state.yaw) * forward - state.velocity.x) * blend;
  state.velocity.z += (-Math.cos(state.yaw) * forward - state.velocity.z) * blend;
  state.velocity.y += (clamp(input.altitude, -1, 1) * 3 - state.velocity.y) * blend;
  state.position.x += state.velocity.x * dt;
  state.position.y += state.velocity.y * dt;
  state.position.z += state.velocity.z * dt;
  applyWorldBounds(state);
}
export function applyWorldBounds(state: FlightState) {
  for (const [axis, min, max] of [
    ['x', -40, 40],
    ['y', 1.5, 12],
    ['z', -40, 40],
  ] as const) {
    const bounded = clamp(state.position[axis], min, max);
    if (bounded !== state.position[axis]) state.velocity[axis] = 0;
    state.position[axis] = bounded;
  }
}
