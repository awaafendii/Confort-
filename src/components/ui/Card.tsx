import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  selected?: boolean;
  noPadding?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, interactive = false, selected = false, noPadding = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-2xl border bg-background shadow-card',
        noPadding ? '' : 'p-5',
        selected ? 'border-primary-600 ring-2 ring-primary-100' : 'border-border',
        interactive && 'cursor-pointer transition-all hover:shadow-elevated hover:-translate-y-0.5',
        className
      )}
      {...props}
    />
  )
);
Card.displayName = 'Card';
