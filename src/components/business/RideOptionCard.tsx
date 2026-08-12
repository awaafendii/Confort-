import React from 'react';
import { cn } from '@/lib/utils';
import { formatFare } from '@/utils/format';

export interface RideOptionCardProps {
  icon: React.ReactNode;
  name: string;
  description: string;
  eta?: string;
  price: number;
  selected: boolean;
  onSelect: () => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Carte de sélection de catégorie de course (BookingPage). Générique — les
 * libellés réels (Standard/Luxe/VIP/Moto-Taxi) restent définis côté page via
 * `RIDE_CATEGORIES_CONFIG` (src/data/pricing.ts), pas modifiés ici. `role="radio"`
 * dans un `role="radiogroup"` (fourni par le conteneur appelant), corrige
 * l'absence de sémantique de groupe de choix exclusif relevée dans l'audit § 3.1.
 */
export const RideOptionCard: React.FC<RideOptionCardProps> = ({
  icon,
  name,
  description,
  eta,
  price,
  selected,
  onSelect,
  disabled = false,
  className,
}) => (
  <button
    type="button"
    role="radio"
    aria-checked={selected}
    disabled={disabled}
    onClick={onSelect}
    className={cn(
      'flex w-full items-center gap-3 rounded-lg border p-4 text-left transition-colors',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-50',
      selected ? 'border-primary-700 bg-primary-50' : 'border-border bg-surface hover:border-primary-200',
      className
    )}
  >
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary-100 text-primary-800">
      {icon}
    </span>
    <span className="min-w-0 flex-1">
      <span className="block text-body font-semibold text-foreground">{name}</span>
      <span className="block truncate text-body-sm text-muted-foreground">{description}</span>
      {eta && <span className="block text-caption text-muted-foreground">{eta}</span>}
    </span>
    <span className="shrink-0 text-body-lg font-bold text-foreground">{formatFare(price)}</span>
  </button>
);
