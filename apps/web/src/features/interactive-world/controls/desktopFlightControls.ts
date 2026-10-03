import type { FlightInput } from '../systems/flightMovement';
export function desktopFlightControls(
  target: HTMLElement,
  input: FlightInput,
  interact: () => void,
  reset: () => void,
  sensitivity: () => number,
) {
  const keys = new Set<string>();
  const update = () => {
    input.forward = Number(keys.has('KeyW')) - Number(keys.has('KeyS'));
    input.turn = Number(keys.has('KeyA')) - Number(keys.has('KeyD'));
    input.altitude =
      Number(keys.has('ArrowUp') || keys.has('Space')) -
      Number(keys.has('ArrowDown') || keys.has('ShiftLeft'));
  };
  const down = (event: KeyboardEvent) => {
    if (event.target instanceof HTMLElement && event.target.closest('input,select,textarea,dialog'))
      return;
    if (
      ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'Space', 'ShiftLeft'].includes(
        event.code,
      )
    ) {
      // Keep Space available to activate HUD buttons by keyboard.
      if (event.code === 'Space' && event.target instanceof HTMLButtonElement) return;
      event.preventDefault();
      keys.add(event.code);
      update();
    }
    if (event.code === 'KeyE' && !event.repeat) interact();
    if (event.code === 'KeyR' && !event.repeat) reset();
  };
  const up = (event: KeyboardEvent) => {
    keys.delete(event.code);
    update();
  };
  const clear = () => {
    keys.clear();
    update();
  };
  let dragging = false,
    previousX = 0,
    previousY = 0;
  const start = (event: PointerEvent) => {
    dragging = true;
    previousX = event.clientX;
    previousY = event.clientY;
    target.setPointerCapture(event.pointerId);
  };
  const move = (event: PointerEvent) => {
    if (!dragging) return;
    input.orbit -= (event.clientX - previousX) * 0.003 * sensitivity();
    input.pitch = Math.min(
      0.9,
      Math.max(-0.3, input.pitch + (event.clientY - previousY) * 0.002 * sensitivity()),
    );
    previousX = event.clientX;
    previousY = event.clientY;
  };
  const end = () => {
    dragging = false;
  };
  window.addEventListener('keydown', down);
  window.addEventListener('keyup', up);
  window.addEventListener('blur', clear);
  target.addEventListener('pointerdown', start);
  target.addEventListener('pointermove', move);
  target.addEventListener('pointerup', end);
  target.addEventListener('pointercancel', end);
  target.addEventListener('lostpointercapture', end);
  return () => {
    clear();
    window.removeEventListener('keydown', down);
    window.removeEventListener('keyup', up);
    window.removeEventListener('blur', clear);
    target.removeEventListener('pointerdown', start);
    target.removeEventListener('pointermove', move);
    target.removeEventListener('pointerup', end);
    target.removeEventListener('pointercancel', end);
    target.removeEventListener('lostpointercapture', end);
  };
}
