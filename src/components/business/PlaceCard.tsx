import React from 'react';
import { Briefcase, Home, Star, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { SavedPlace } from '@/types';

export interface PlaceCardProps {
  place: SavedPlace;
  onRemove?: () => void;
  onClick?: () => void;
  className?: string;
}

const ICONS: Record<NonNullable<SavedPlace['icon']>, React.ReactNode> = {
  home: <Home className="h-4 w-4" />,
  work: <Briefcase className="h-4 w-4" />,
  star: <Star className="h-4 w-4" />,
};

const LABELS: Record<string, string> = { Home: 'Domicile', Work: 'Travail' };

/** Carte de lieu enregistré (Domicile/Travail/Favoris) — absent du design system d'origine (audit § 7, pattern recomposé à la main dans SavedPlacesPage). */
export const PlaceCard: React.FC<PlaceCardProps> = ({ place, onRemove, onClick, className }) => (
  <Card interactive={!!onClick} onClick={onClick} className={cn('flex items-center gap-3.5', className)}>
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-800">
      {ICONS[place.icon ?? 'star']}
    </span>
    <span className="min-w-0 flex-1">
      <span className="block truncate text-body font-semibold text-foreground">{LABELS[place.label] ?? place.label}</span>
      <span className="block truncate text-body-sm text-muted-foreground">{place.address}</span>
    </span>
    {onRemove && (
      <button
        type="button"
        aria-label={`Supprimer ${LABELS[place.label] ?? place.label}`}
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="tap-target flex shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-danger/10 hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    )}
  </Card>
);
