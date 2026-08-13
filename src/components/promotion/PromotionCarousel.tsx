import React, { useRef, useState } from 'react';
import { PromotionCard, type PromotionItem } from './PromotionCard';
import { cn } from '@/lib/utils';

export interface PromotionCarouselProps {
  promotions: PromotionItem[];
  onSelect?: (promotion: PromotionItem) => void;
  className?: string;
}

/** Swipe horizontal avec snapping + pagination discrète (Phase 8 § 13) — pas de défilement automatique agressif. */
export const PromotionCarousel: React.FC<PromotionCarouselProps> = ({ promotions, onSelect, className }) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const onScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    const cardWidth = track.firstElementChild?.clientWidth ?? 1;
    setActive(Math.round(track.scrollLeft / (cardWidth + 12)));
  };

  if (promotions.length === 0) return null;

  return (
    <div className={cn('w-full', className)}>
      <div
        ref={trackRef}
        onScroll={onScroll}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {promotions.map((promo) => (
          <div key={promo.id} className="w-[85%] shrink-0 snap-start sm:w-[360px]">
            <PromotionCard promotion={promo} onSelect={onSelect ? () => onSelect(promo) : undefined} />
          </div>
        ))}
      </div>
      {promotions.length > 1 && (
        <div className="mt-2.5 flex items-center justify-center gap-1.5" aria-hidden="true">
          {promotions.map((promo, i) => (
            <span key={promo.id} className={cn('h-1.5 rounded-full transition-all', i === active ? 'w-5 bg-accent-600' : 'w-1.5 bg-border')} />
          ))}
        </div>
      )}
    </div>
  );
};
