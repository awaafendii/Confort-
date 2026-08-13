import React from 'react';
import { Badge } from '@/components/ui';
import { cn } from '@/lib/utils';

export interface ServiceItem {
  id: string;
  name: string;
  image: string;
  /** true pour les services annoncés mais pas encore branchés à un vrai flux (Phase 8 — pas de logique livraison/cargo/food/business dans l'app aujourd'hui). */
  comingSoon?: boolean;
  /** true quand `image` contient déjà son propre libellé composé dans le visuel — n'affiche pas de texte surimposé pour éviter le doublon (même pattern que `PromotionItem.selfContained`). */
  selfContained?: boolean;
}

export interface ServiceCardProps {
  service: ServiceItem;
  onSelect?: () => void;
  className?: string;
}

/** Représentation visuelle d'un service — l'image domine, le texte reste secondaire (Phase 8 § 8). */
export const ServiceCard: React.FC<ServiceCardProps> = ({ service, onSelect, className }) => {
  const inactive = service.comingSoon || !onSelect;
  return (
    <button
      type="button"
      disabled={inactive}
      onClick={onSelect}
      aria-label={service.comingSoon ? `${service.name} — bientôt disponible` : service.name}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-lg border border-border bg-surface text-left transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        inactive ? 'cursor-default' : 'hover:-translate-y-0.5 hover:shadow-elevated',
        className
      )}
    >
      <div className={cn('aspect-square w-full overflow-hidden bg-primary-50', service.comingSoon && 'opacity-60')}>
        <img src={service.image} alt="" aria-hidden="true" loading="lazy" className="h-full w-full object-cover" />
      </div>
      {service.comingSoon && (
        <Badge variant="neutral" className="absolute right-2 top-2">
          Bientôt
        </Badge>
      )}
      {/* `alt`/`aria-hidden` restent inconditionnels même si selfContained : le <button> englobant porte déjà aria-label={service.name} (ligne ~27), pas besoin de doubler l'annonce pour un lecteur d'écran. */}
      {!service.selfContained && <p className="px-3 py-2.5 text-body-sm font-semibold text-foreground">{service.name}</p>}
    </button>
  );
};
