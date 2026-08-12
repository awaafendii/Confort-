import React from 'react';
import { Card, type CardProps } from '@/components/ui';
import { VEHICLE_COLORS } from '@/data/vehicleColors';
import { cn } from '@/lib/utils';
import type { Vehicle } from '@/types';

export interface VehicleCardProps extends Omit<CardProps, 'children' | 'noPadding'> {
  vehicle: Vehicle;
}

/** Affichage véhicule recomposé à la main sur BookingPage/VehiclePage (audit § 7). */
export const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle, className, ...cardProps }) => {
  const color = VEHICLE_COLORS[vehicle.color];
  return (
    <Card noPadding className={cn('flex items-center gap-3 p-4', className)} {...cardProps}>
      <span
        className="h-9 w-9 shrink-0 rounded-full border border-border"
        style={{ backgroundColor: color.hex }}
        aria-hidden="true"
      />
      <span className="min-w-0 flex-1">
        <span className="block text-body font-semibold text-foreground">
          {vehicle.brand} {vehicle.model}
        </span>
        <span className="block text-body-sm text-muted-foreground">
          {color.label} · {vehicle.plateNumber}
        </span>
      </span>
    </Card>
  );
};
