import React from 'react';
import { Button } from './Button';
import { cn } from '@/lib/utils';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, actionLabel, onAction, className }) => (
  <div className={cn('flex flex-col items-center justify-center px-6 py-14 text-center', className)}>
    {icon && (
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-surface text-muted-foreground">
        {icon}
      </div>
    )}
    <h3 className="text-base font-semibold text-foreground">{title}</h3>
    {description && <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">{description}</p>}
    {actionLabel && onAction && (
      <Button variant="outline" size="sm" onClick={onAction} className="mt-5">
        {actionLabel}
      </Button>
    )}
  </div>
);
