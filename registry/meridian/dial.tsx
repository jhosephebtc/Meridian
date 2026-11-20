import * as React from 'react';
import { cn } from './utils';

export interface DialProps {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  detent?: boolean;
  label?: string;
  className?: string;
  disabled?: boolean;
}

/** Absolute pointer-angle mapping (−135°→135°), keyboard-friendly range input. */
export function Dial({
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  detent = false,
  label = 'Dial',
  className,
  disabled,
}: DialProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const drag = React.useRef<number | null>(null);
  const [dragging, setDragging] = React.useState(false);
  const fraction = max > min ? Math.max(0, Math.min(1, (value - min) / (max - min))) : 0;
  const turn = -135 + fraction * 270;

  const setFromPointer = (event: React.PointerEvent) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const dx = event.clientX - (bounds.left + bounds.width / 2);
    const dy = event.clientY - (bounds.top + bounds.height / 2);
    if (Math.hypot(dx, dy) < 8) return;
    const pointerAngle = (((Math.atan2(dy, dx) * 180) / Math.PI + 90 + 360) % 360);
    const mapped =
      pointerAngle > 135 && pointerAngle < 225
        ? pointerAngle < 180
          ? 135
          : -135
        : pointerAngle >= 225
          ? pointerAngle - 360
          : pointerAngle;
    let raw = min + ((mapped + 135) / 270) * (max - min);
    const increment = detent ? Math.max(step, 10) : step;
    raw = min + Math.round((raw - min) / increment) * increment;
    onValueChange(Math.max(min, Math.min(max, raw)));
  };

  const release = () => {
    drag.current = null;
    setDragging(false);
  };

  return (
    <div
      ref={rootRef}
      className={cn('ml-dial', className)}
      data-dragging={dragging || undefined}
      style={{ ['--ml-dial-turn' as string]: `${turn}deg` }}
    >
      <svg viewBox="0 0 120 120" aria-hidden="true">
        <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeOpacity="0.18" strokeWidth="1" />
        <path d="M22 88 A48 48 0 1 1 98 88" fill="none" stroke="currentColor" strokeOpacity="0.28" strokeWidth="1" />
        <g className="ml-dial-knob">
          <circle cx="60" cy="60" r="28" fill="var(--ds-bg)" stroke="currentColor" strokeWidth="1.5" />
          <line x1="60" y1="60" x2="60" y2="38" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </g>
      </svg>
      <input
        type="range"
        min={min}
        max={max}
        step={detent ? Math.max(step, 10) : step}
        value={value}
        disabled={disabled}
        aria-label={label}
        onChange={(e) => onValueChange(e.currentTarget.valueAsNumber)}
        onPointerDown={(event) => {
          if (disabled || event.button !== 0) return;
          event.preventDefault();
          event.currentTarget.focus();
          event.currentTarget.setPointerCapture(event.pointerId);
          drag.current = event.pointerId;
          setDragging(true);
          setFromPointer(event);
        }}
        onPointerMove={(event) => {
          if (drag.current !== event.pointerId) return;
          setFromPointer(event);
        }}
        onPointerUp={release}
        onPointerCancel={release}
        onLostPointerCapture={release}
      />
      <div className="ml-slider-readout" style={{ position: 'absolute', inset: 'auto 0 4px', pointerEvents: 'none' }}>
        {Math.round(value)}
      </div>
    </div>
  );
}
