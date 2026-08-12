import React from 'react';
import { Badge, type BadgeProps } from './Badge';

export interface StatusConfig {
  label: string;
  variant: NonNullable<BadgeProps['variant']>;
}

export interface StatusBadgeProps<S extends string> {
  status: S;
  config: Record<S, StatusConfig>;
  className?: string;
}

/**
 * Rendu générique d'un statut → Badge. Ne remplace pas les configs de labels
 * propres à chaque domaine (statut de course, de paiement, de ticket...) mais
 * consolide leur RENDU, dupliqué à l'identique dans ~6 fichiers d'après
 * l'audit (docs/UIUX_AUDIT.md § 7). Usage : `<StatusBadge status={ride.status}
 * config={RIDE_STATUS_CONFIG} />` où RIDE_STATUS_CONFIG reste défini côté page.
 */
export function StatusBadge<S extends string>({ status, config, className }: StatusBadgeProps<S>) {
  const entry = config[status];
  if (!entry) return null;
  return (
    <Badge variant={entry.variant} className={className}>
      {entry.label}
    </Badge>
  );
}
