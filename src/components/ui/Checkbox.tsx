import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, className, id, ...props }, ref) => {
    const checkboxId = id || props.name;
    return (
      <label htmlFor={checkboxId} className="flex cursor-pointer items-start gap-3">
        <span className="relative mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
          <input ref={ref} type="checkbox" id={checkboxId} className={cn('peer sr-only', className)} {...props} />
          <span className="h-5 w-5 rounded-sm border-2 border-input bg-background transition-colors peer-checked:border-primary-800 peer-checked:bg-primary-800 peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2" />
          <Check className="pointer-events-none absolute h-3.5 w-3.5 scale-0 text-white transition-transform peer-checked:scale-100" strokeWidth={3} />
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
Checkbox.displayName = 'Checkbox';
