import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

/**
 * Select natif stylisé — le design system n'en avait aucun (le seul <select>
 * du code, dans StyleGuidePage, était non harmonisé). Reste un <select> natif
 * plutôt qu'un listbox custom pour l'accessibilité clavier/mobile gratuite.
 */
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, className, id, children, ...props }, ref) => {
    const selectId = id || props.name;
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="mb-1.5 ml-0.5 block text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            aria-invalid={!!error}
            aria-describedby={error ? `${selectId}-error` : undefined}
            className={cn(
              'h-12 w-full appearance-none rounded-md border bg-background px-4 pr-10 text-body text-foreground outline-none transition-colors',
              'focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              error ? 'border-danger focus-visible:border-danger focus-visible:ring-danger' : 'border-input',
              className
            )}
            {...props}
          >
            {children}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
        </div>
        {error ? (
          <p id={`${selectId}-error`} className="mt-1.5 ml-0.5 text-sm text-danger">
            {error}
          </p>
        ) : helperText ? (
          <p className="mt-1.5 ml-0.5 text-sm text-muted-foreground">{helperText}</p>
        ) : null}
      </div>
    );
  }
);
Select.displayName = 'Select';
