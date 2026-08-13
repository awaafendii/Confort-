import React from 'react';
import { Badge, Skeleton } from '@/components/ui';
import { formatFare } from '@/utils/format';
import { cn } from '@/lib/utils';
import type { VehicleCatalogEntry } from '@/data/vehicles';

export interface VehicleOptionCardProps {
  vehicle: VehicleCatalogEntry;
  eta?: string;
  price: number;
  selected: boolean;
  onSelect: () => void;
  disabled?: boolean;
  unavailable?: boolean;
  className?: string;
}

/**
 * Carte de sélection de catégorie de course, visuel dominant (Phase 8 § 5-7) — remplace la
 * variante icône de `RideOptionCard` dans BookingPage. `RideOptionCard` reste disponible pour
 * les contextes sans visuel dédié ; ne pas le supprimer (StyleGuidePage le documente encore).
 */
export const VehicleOptionCard: React.FC<VehicleOptionCardProps> = ({
  vehicle,
  eta,
  price,
  selected,
  onSelect,
  disabled = false,
  unavailable = false,
  className,
}) => {
  const isInactive = disabled || unavailable;
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      disabled={isInactive}
      onClick={onSelect}
      className={cn(
        'flex w-[152px] shrink-0 flex-col overflow-visible rounded-lg border bg-surface text-left transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        isInactive
          ? 'cursor-not-allowed border-border opacity-50'
          : selected
            ? 'scale-[1.02] border-accent-600 shadow-elevated ring-1 ring-accent-600'
            : 'border-border hover:-translate-y-0.5 hover:shadow-card',
        className
      )}
    >
      <div className="relative -mt-3 flex h-20 items-center justify-center px-2">
        <img src={vehicle.image} alt={vehicle.name} className="h-full w-full object-contain" loading="lazy" />
        {vehicle.badge && (
          <Badge variant="accent" className="absolute right-1 top-0">
            {vehicle.badge}
          </Badge>
        )}
      </div>
      <div className="space-y-0.5 px-3 pb-3">
        <p className="text-body-sm font-semibold text-foreground">{vehicle.name}</p>
        {eta && <p className="text-caption text-muted-foreground">{eta}</p>}
        <p className="text-body-sm font-bold text-foreground">{unavailable ? 'Indisponible' : formatFare(price)}</p>
      </div>
    </button>
  );
};

export const VehicleOptionCardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('flex w-[152px] shrink-0 flex-col gap-2 rounded-lg border border-border bg-surface p-3', className)} aria-hidden="true">
    <Skeleton className="h-16 w-full rounded-md" />
    <Skeleton className="h-3.5 w-3/4" />
    <Skeleton className="h-3 w-1/2" />
    <Skeleton className="h-4 w-2/3" />
  </div>
);
