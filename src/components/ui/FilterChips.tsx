import React from 'react';
import { cn } from '@/lib/utils';

export interface FilterChipOption<T extends string> {
  id: T;
  label: string;
}

export interface FilterChipsProps<T extends string> {
  options: FilterChipOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label?: string;
  className?: string;
}

/**
 * Extrait le bloc de chips dupliqué à l'identique dans 5 pages admin
 * (Utilisateurs, Chauffeurs, Courses, Paiements, Support — audit § 3.3),
 * avec `aria-checked` désormais présent (absent dans les 5 copies d'origine).
 */
export function FilterChips<T extends string>({ options, value, onChange, label, className }: FilterChipsProps<T>) {
  return (
    <div role="radiogroup" aria-label={label} className={cn('flex gap-2 overflow-x-auto pb-1', className)}>
      {options.map((option) => {
        const active = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.id)}
            className={cn(
              'shrink-0 rounded-full border px-3.5 py-1.5 text-body-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              active ? 'border-primary-700 bg-primary-50 text-primary-800' : 'border-border text-muted-foreground'
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
