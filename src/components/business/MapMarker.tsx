import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Couleurs de repère cartographique centralisées — MapLibre consomme des hex
 * bruts (pas de classes Tailwind), ce qui avait conduit à coder `#1B6854`/
 * `#0F2A4D` en dur directement dans TrackingPage/DriverTrackingPage (audit
 * § 5). Ces valeurs sont les équivalents hex exacts des tokens `accent-600`/
 * `primary-800` — à importer ici plutôt qu'à réécrire dans chaque écran.
 */
export const MAP_MARKER_COLORS = {
  pickup: '#16A875', // accent-600
  destination: '#102A43', // primary-800
} as const;

export interface MapMarkerIconProps {
  color: string;
  size?: number;
  className?: string;
}

/** Repère ponctuel (pastille + halo) pour un overlay HTML au-dessus de la carte, si besoin d'un marqueur DOM plutôt qu'une couche MapLibre. */
export const MapMarkerIcon: React.FC<MapMarkerIconProps> = ({ color, size = 16, className }) => (
  <span
    className={cn('relative inline-flex items-center justify-center rounded-full', className)}
    style={{ width: size, height: size }}
    aria-hidden="true"
  >
    <span className="absolute inset-0 animate-pulse rounded-full opacity-30" style={{ backgroundColor: color }} />
    <span className="relative h-1/2 w-1/2 rounded-full border-2 border-white" style={{ backgroundColor: color }} />
  </span>
);
