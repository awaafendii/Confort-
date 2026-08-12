import React from 'react';
import { Car, Bike } from 'lucide-react';
import { Card, StatusBadge, type StatusConfig } from '@/components/ui';
import { formatFare, formatRelativeTime } from '@/utils/format';
import { cn } from '@/lib/utils';
import type { Ride, RideStatus } from '@/types';

export interface RideCardProps {
  ride: Ride;
  statusConfig: Record<RideStatus, StatusConfig>;
  /** Nom du chauffeur, affiché sous la date quand fourni (ex. historique passager). */
  driverName?: string;
  onClick?: () => void;
  className?: string;
}

/**
 * Carte de course pour les listes d'historique (passager/chauffeur) —
 * variantes légèrement différentes recomposées à la main sur ≥3 écrans
 * (audit § 7). `statusConfig` reste fourni par la page pour ne pas figer les
 * libellés français dans un composant partagé.
 */
export const RideCard: React.FC<RideCardProps> = ({ ride, statusConfig, driverName, onClick, className }) => (
  <Card interactive={!!onClick} onClick={onClick} className={cn('flex items-center gap-3', className)}>
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary-50 text-primary-800">
      {ride.vehicleType === 'MOTO' ? <Bike className="h-5 w-5" /> : <Car className="h-5 w-5" />}
    </span>
    <span className="min-w-0 flex-1">
      <span className="block truncate text-body font-semibold text-foreground">
        {ride.pickup.label} → {ride.destination.label}
      </span>
      <span className="block text-body-sm text-muted-foreground">{formatRelativeTime(ride.requestedAt)}</span>
      {driverName && <span className="block truncate text-caption text-muted-foreground">{driverName}</span>}
    </span>
    <span className="shrink-0 text-right">
      <span className="block text-body font-semibold text-foreground">{formatFare(ride.fare)}</span>
      <StatusBadge status={ride.status} config={statusConfig} className="mt-1" />
    </span>
  </Card>
);
