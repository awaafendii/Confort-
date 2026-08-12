import React from 'react';
import { Avatar, Rating } from '@/components/ui';
import { VEHICLE_COLORS } from '@/data/vehicleColors';
import { cn } from '@/lib/utils';
import type { Driver } from '@/types';

export interface DriverCardProps {
  driver: Driver;
  eta?: string;
  className?: string;
}

/** Carte chauffeur (matching, dashboard chauffeur, tracking) — recomposée à la main à chaque écran d'après l'audit § 7. */
export const DriverCard: React.FC<DriverCardProps> = ({ driver, eta, className }) => {
  const color = VEHICLE_COLORS[driver.vehicle.color];
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <Avatar name={driver.name} src={driver.avatar} size="lg" status={driver.status === 'ONLINE' ? 'online' : undefined} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-body font-semibold text-foreground">{driver.name}</p>
        <Rating value={driver.rating} showValue size={13} />
        <p className="mt-0.5 flex items-center gap-1.5 text-body-sm text-muted-foreground">
          <span className="h-2 w-2 shrink-0 rounded-full border border-border" style={{ backgroundColor: color.hex }} aria-hidden="true" />
          {driver.vehicle.brand} {driver.vehicle.model} · {driver.vehicle.plateNumber}
        </p>
      </div>
      {eta && (
        <div className="shrink-0 text-right">
          <p className="text-h3 text-foreground">{eta}</p>
          <p className="text-caption text-muted-foreground">arrivée</p>
        </div>
      )}
    </div>
  );
};
