import React from 'react';
import { cn } from '@/lib/utils';
import type { RideStop } from '@/types';

export interface RideSummaryProps {
  pickup: RideStop;
  destination: RideStop;
  className?: string;
}

/** Timeline départ→arrivée réutilisée en variantes légèrement différentes sur ≥5 écrans (audit § 7). */
export const RideSummary: React.FC<RideSummaryProps> = ({ pickup, destination, className }) => (
  <div className={cn('flex gap-3', className)}>
    <div className="flex flex-col items-center pt-1.5">
      <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-accent-600" aria-hidden="true" />
      <span className="my-1 w-px flex-1 bg-border" aria-hidden="true" />
      <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-primary-800" aria-hidden="true" />
    </div>
    <div className="flex flex-1 flex-col gap-4">
      <div>
        <p className="text-body font-semibold text-foreground">{pickup.label}</p>
        <p className="text-body-sm text-muted-foreground">{pickup.address}</p>
      </div>
      <div>
        <p className="text-body font-semibold text-foreground">{destination.label}</p>
        <p className="text-body-sm text-muted-foreground">{destination.address}</p>
      </div>
    </div>
  </div>
);
