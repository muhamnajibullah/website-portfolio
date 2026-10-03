import { useRef, type PointerEvent } from 'react';
import type { FlightInput } from '../systems/flightMovement';
import { clamp } from '../systems/flightMovement';
export function TouchFlightControls({ input }: { input: FlightInput }) {
  const knob = useRef<HTMLSpanElement>(null);
  const stop = () => {
    input.forward = 0;
    input.turn = 0;
    if (knob.current) knob.current.style.transform = 'translate(0,0)';
  };
  const move = (event: PointerEvent<HTMLDivElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = clamp((event.clientX - bounds.left - bounds.width / 2) / 40, -1, 1);
    const y = clamp((event.clientY - bounds.top - bounds.height / 2) / 40, -1, 1);
    input.turn = -x;
    input.forward = -y;
    if (knob.current) knob.current.style.transform = `translate(${x * 30}px,${y * 30}px)`;
  };
  return (
    <div className="touch-controls">
      <div
        className="joystick"
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          move(event);
        }}
        onPointerMove={move}
        onPointerUp={stop}
        onPointerCancel={stop}
        onLostPointerCapture={stop}
        aria-hidden="true"
      >
        <span ref={knob} />
        <span className="joystick-label">MOVE</span>
      </div>
      <div className="altitude-controls">
        {[1, -1].map((value) => (
          <button
            key={value}
            className="icon-button"
            aria-label={value === 1 ? 'Ascend helicopter' : 'Descend helicopter'}
            onPointerDown={(event) => {
              event.currentTarget.setPointerCapture(event.pointerId);
              input.altitude = value;
            }}
            onPointerUp={() => {
              input.altitude = 0;
            }}
            onPointerCancel={() => {
              input.altitude = 0;
            }}
            onLostPointerCapture={() => {
              input.altitude = 0;
            }}
            onKeyDown={(event) => {
              if (['Enter', ' '].includes(event.key)) input.altitude = value;
            }}
            onKeyUp={() => {
              input.altitude = 0;
            }}
            onBlur={() => {
              input.altitude = 0;
            }}
          >
            {value === 1 ? '↑' : '↓'}
          </button>
        ))}
      </div>
    </div>
  );
}
