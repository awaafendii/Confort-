import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Regroupe un ou plusieurs Skeleton sous une seule annonce "Chargement" pour
 * les lecteurs d'écran, au lieu de répéter role="status" sur chaque fragment
 * décoratif individuel (ex. 5 SkeletonCard dans une liste = 5 annonces avant
 * ce correctif). Les fragments internes sont purement visuels (aria-hidden).
 */
export const SkeletonGroup: React.FC<{ children: React.ReactNode; label?: string; className?: string }> = ({
  children,
  label = 'Chargement',
  className,
}) => (
  <div role="status" aria-label={label} className={className}>
    {children}
  </div>
);

export const Skeleton: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div aria-hidden="true" className={cn('skeleton animate-shimmer rounded-lg', className)} {...props} />
);

export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({ lines = 3, className }) => (
  <div className={cn('space-y-2', className)} aria-hidden="true">
    {Array.from({ length: lines }, (_, i) => (
      <Skeleton key={i} className={cn('h-3', i === lines - 1 ? 'w-2/3' : 'w-full')} />
    ))}
  </div>
);

export const SkeletonCircle: React.FC<{ size?: number; className?: string }> = ({ size = 44, className }) => (
  <Skeleton className={cn('rounded-full', className)} style={{ width: size, height: size }} />
);

export const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('rounded-lg border border-border p-5', className)} aria-hidden="true">
    <div className="flex items-center gap-3">
      <SkeletonCircle />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  </div>
);
