import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface RatingProps {
  value: number;
  max?: number;
  size?: number;
  interactive?: boolean;
  onChange?: (value: number) => void;
  showValue?: boolean;
  className?: string;
}

export const Rating: React.FC<RatingProps> = ({
  value,
  max = 5,
  size = 18,
  interactive = false,
  onChange,
  showValue = false,
  className,
}) => {
  const stars = Array.from({ length: max }, (_, i) => i + 1);

  return (
    <div className={cn('inline-flex items-center gap-1', className)} role={interactive ? 'radiogroup' : undefined}>
      {stars.map((star) => {
        const filled = star <= Math.round(value);
        return (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            aria-label={`${star} étoile${star > 1 ? 's' : ''}`}
            onClick={() => interactive && onChange?.(star)}
            className={cn(!interactive && 'pointer-events-none', interactive && 'tap-target')}
          >
            <Star
              width={size}
              height={size}
              className={filled ? 'fill-warning text-warning' : 'fill-transparent text-border'}
            />
          </button>
        );
      })}
      {showValue && <span className="ml-1 text-sm font-semibold text-foreground">{value.toFixed(1)}</span>}
    </div>
  );
};
