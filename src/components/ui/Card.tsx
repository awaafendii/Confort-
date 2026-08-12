import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  selected?: boolean;
  noPadding?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, interactive = false, selected = false, noPadding = false, role, tabIndex, onKeyDown, onClick, ...props }, ref) => (
    <div
      ref={ref}
      role={interactive ? (role ?? 'button') : role}
      tabIndex={interactive ? (tabIndex ?? 0) : tabIndex}
      onClick={onClick}
      onKeyDown={(e) => {
        onKeyDown?.(e);
        // Une Card interactive est un <div>, pas un vrai <button> — sans ceci elle
        // n'était activable qu'à la souris malgré sa prop `interactive`/`onClick`.
        if (interactive && onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick(e as unknown as React.MouseEvent<HTMLDivElement>);
        }
      }}
      className={cn(
        'rounded-lg border bg-surface shadow-card',
        noPadding ? '' : 'p-5',
        selected ? 'border-primary-600 ring-2 ring-ring' : 'border-border',
        interactive &&
          'cursor-pointer transition-all hover:shadow-elevated hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        className
      )}
      {...props}
    />
  )
);
Card.displayName = 'Card';
