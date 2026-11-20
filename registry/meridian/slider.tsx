import * as React from 'react';
import { cn } from './utils';

export interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  value: number;
  onValueChange: (value: number) => void;
  label?: string;
}

/** Hairline track + circular thumb with 1:1 pointer capture. */
export function Slider({
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  label = 'Slider',
  className,
  disabled,
}: SliderProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = React.useState(false);
  const minN = Number(min);
  const maxN = Number(max);
  const pct = maxN > minN ? ((value - minN) / (maxN - minN)) * 100 : 0;

  const setFromClientX = (clientX: number) => {
    const el = rootRef.current?.querySelector('.ml-slider-track') as HTMLElement | null;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const t = Math.max(0, Math.min(1, (clientX - r.left) / r.width));
    const raw = minN + t * (maxN - minN);
    const next = minN + Math.round((raw - minN) / Number(step)) * Number(step);
    onValueChange(Math.max(minN, Math.min(maxN, next)));
  };

  return (
    <div
      ref={rootRef}
      className={cn('ml-slider', className)}
      data-dragging={dragging || undefined}
      style={{ ['--ml-slider-pct' as string]: `${pct}%` }}
    >
      <div
        className="ml-slider-track"
        onPointerDown={(e) => {
          if (disabled || e.button !== 0) return;
          setDragging(true);
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          setFromClientX(e.clientX);
        }}
        onPointerMove={(e) => {
          if (!dragging) return;
          setFromClientX(e.clientX);
        }}
        onPointerUp={() => setDragging(false)}
        onPointerCancel={() => setDragging(false)}
      >
        <div className="ml-slider-range" />
        <div className="ml-slider-thumb" />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          aria-label={label}
          onChange={(e) => onValueChange(e.currentTarget.valueAsNumber)}
        />
      </div>
      <div className="ml-slider-readout">{Math.round(value)}%</div>
    </div>
  );
}
