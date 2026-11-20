import * as React from 'react';
import { cn } from './utils';

export interface SwitchProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export function Switch({ checked, onCheckedChange, className, disabled, ...props }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      className={cn('ml-switch', className)}
      onClick={() => onCheckedChange(!checked)}
      {...props}
    >
      <span className="ml-switch-thumb" aria-hidden="true" />
    </button>
  );
}
