import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, icon, error, helperText, className, id, ...props }, ref) => {
    const inputId = id || props.name;
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="mb-1.5 ml-0.5 block text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
            className={cn(
              'h-12 w-full rounded-xl border bg-background px-4 text-[15px] text-foreground placeholder:text-muted-foreground outline-none transition-colors',
              'focus:border-primary-500 focus:ring-2 focus:ring-primary-100',
              icon && 'pl-11',
              error ? 'border-danger focus:border-danger focus:ring-danger/10' : 'border-input',
              className
            )}
            {...props}
          />
        </div>
        {error ? (
          <p id={`${inputId}-error`} className="mt-1.5 ml-0.5 text-sm text-danger">
            {error}
          </p>
        ) : helperText ? (
          <p className="mt-1.5 ml-0.5 text-sm text-muted-foreground">{helperText}</p>
        ) : null}
      </div>
    );
  }
);
Input.displayName = 'Input';
