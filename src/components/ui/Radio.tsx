import React from 'react';
import { cn } from '@/lib/utils';

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ label, description, className, id, ...props }, ref) => {
    const radioId = id || `${props.name}-${props.value}`;
    return (
      <label htmlFor={radioId} className="flex cursor-pointer items-start gap-3">
        <span className="relative mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
          <input ref={ref} type="radio" id={radioId} className={cn('peer sr-only', className)} {...props} />
          <span className="h-5 w-5 rounded-full border-2 border-input bg-background transition-colors peer-checked:border-primary-800 peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2" />
          <span className="absolute h-2.5 w-2.5 scale-0 rounded-full bg-primary-800 transition-transform peer-checked:scale-100" />
        </span>
        {(label || description) && (
          <span className="flex flex-col">
            {label && <span className="text-body font-medium text-foreground">{label}</span>}
            {description && <span className="text-body-sm text-muted-foreground">{description}</span>}
          </span>
        )}
      </label>
    );
  }
);
Radio.displayName = 'Radio';
