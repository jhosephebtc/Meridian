import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from './utils';

const buttonVariants = cva('ml-btn', {
  variants: {
    variant: {
      primary: 'ml-btn-primary',
      secondary: '',
      ghost: 'ml-btn-ghost',
    },
  },
  defaultVariants: { variant: 'secondary' },
});

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

/** Meridian line button — local press ripple + scale(0.97) physics (jhosephe gestures). */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, loading, disabled, onPointerDown, children, type = 'button', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(buttonVariants({ variant }), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      onPointerDown={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        event.currentTarget.style.setProperty('--ml-press-x', `${event.clientX - rect.left}px`);
        event.currentTarget.style.setProperty('--ml-press-y', `${event.clientY - rect.top}px`);
        onPointerDown?.(event);
      }}
      {...props}
    >
      {loading ? 'Working…' : children}
    </button>
  );
});
