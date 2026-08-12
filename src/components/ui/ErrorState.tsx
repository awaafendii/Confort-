import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './Button';
import { cn } from '@/lib/utils';

export interface ErrorStateProps {
  title?: string;
  description?: string;
  retryLabel?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Une erreur est survenue",
  description = 'Vérifiez votre connexion et réessayez.',
  retryLabel = 'Réessayer',
  onRetry,
  className,
}) => (
  <div className={cn('flex flex-col items-center justify-center px-6 py-14 text-center', className)}>
    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-danger/10 text-danger">
      <AlertTriangle className="h-7 w-7" />
    </div>
    <h3 className="text-base font-semibold text-foreground">{title}</h3>
    <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">{description}</p>
    {onRetry && (
      <Button variant="primary" size="sm" onClick={onRetry} className="mt-5">
        {retryLabel}
      </Button>
    )}
  </div>
);
