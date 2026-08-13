import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui';
import { cn } from '@/lib/utils';

export interface PromotionItem {
  id: string;
  image: string;
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  badge?: string;
  /** true quand le visuel contient déjà son propre titre/sous-titre/CTA composés dans l'image — n'affiche pas de texte surimposé pour éviter le doublon. `title` reste obligatoire pour l'alt text/l'accessibilité. */
  selfContained?: boolean;
}

export interface PromotionCardProps {
  promotion: PromotionItem;
  onSelect?: () => void;
  className?: string;
}

/** Bannière de campagne — l'image porte l'essentiel ; texte surimposé seulement si l'image ne le contient pas déjà (Phase 8 § 12). */
export const PromotionCard: React.FC<PromotionCardProps> = ({ promotion, onSelect, className }) => {
  const Wrapper = onSelect ? 'button' : 'div';
  return (
    <Wrapper
      type={onSelect ? 'button' : undefined}
      onClick={onSelect}
      className={cn(
        'relative flex aspect-[16/9] w-full shrink-0 flex-col justify-end overflow-hidden rounded-lg text-left',
        onSelect && 'transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        className
      )}
    >
      <img
        src={promotion.image}
        alt={promotion.selfContained ? promotion.title : ''}
        aria-hidden={promotion.selfContained ? undefined : true}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover"
      />
      {!promotion.selfContained && (
        <>
          <div className="absolute inset-0 bg-gradient-to-t from-primary-950/70 via-primary-950/10 to-transparent" />
          {promotion.badge && (
            <Badge variant="accent" className="absolute left-4 top-4">
              {promotion.badge}
            </Badge>
          )}
          <div className="relative p-4 text-white">
            <p className="font-display text-h3">{promotion.title}</p>
            {promotion.subtitle && <p className="mt-1 text-body-sm text-white/85">{promotion.subtitle}</p>}
            {promotion.ctaLabel && (
              <span className="mt-2 inline-flex items-center gap-1 text-body-sm font-semibold text-accent-300">
                {promotion.ctaLabel} <ChevronRight className="h-4 w-4" />
              </span>
            )}
          </div>
        </>
      )}
    </Wrapper>
  );
};
