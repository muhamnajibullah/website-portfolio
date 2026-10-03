import { describe, expect, it } from 'vitest';
import {
  createFlightInput,
  createFlightState,
  updateFlight,
} from '../../apps/web/src/features/interactive-world/systems/flightMovement';
import { proximity } from '../../apps/web/src/features/interactive-world/systems/proximitySystem';
import { pointSchema } from '../../packages/validation/src';
describe('casual helicopter controls', () => {
  it('has consistent movement at 30, 60 and 120 fps', () => {
    const distances = [30, 60, 120].map((fps) => {
      const state = createFlightState(),
        input = createFlightInput();
      input.forward = 1;
      for (let frame = 0; frame < fps * 2; frame++) updateFlight(state, input, 1 / fps);
      return state.position.z;
    });
    expect(Math.max(...distances) - Math.min(...distances)).toBeLessThan(0.12);
  });
  it('stops safely at altitude/world bounds and decelerates without input', () => {
    const state = createFlightState(),
      input = createFlightInput();
    input.forward = 1;
    input.altitude = 1;
    for (let i = 0; i < 1000; i++) updateFlight(state, input, 0.05);
    expect(state.position.z).toBe(-40);
    expect(state.position.y).toBe(12);
    expect(state.velocity.y).toBe(0);
    input.forward = 0;
    input.altitude = 0;
    for (let i = 0; i < 100; i++) updateFlight(state, input, 0.016);
    expect(Math.abs(state.velocity.z)).toBeLessThan(0.02);
  });
  it('distinguishes discovery, focus and interaction without requiring landing', () => {
    const point = pointSchema.parse({
      id: '00000000-0000-4000-8000-000000000001',
      project_id: '00000000-0000-4000-8000-000000000002',
      x: 0,
      y: 3,
      z: 0,
    });
    expect(proximity({ x: 25, y: 3, z: 0 }, point).zone).toBe('outside');
    expect(proximity({ x: 18, y: 3, z: 0 }, point).zone).toBe('discovery');
    expect(proximity({ x: 10, y: 3, z: 0 }, point).zone).toBe('focus');
    expect(proximity({ x: 0, y: 7, z: 0 }, point).zone).toBe('interaction');
  });
});
