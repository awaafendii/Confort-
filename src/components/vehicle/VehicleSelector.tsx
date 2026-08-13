import React from 'react';
import { motion } from 'framer-motion';
import { VehicleOptionCard, VehicleOptionCardSkeleton } from './VehicleOptionCard';
import { VEHICLE_CATALOG } from '@/data/vehicles';
import { cn } from '@/lib/utils';
import type { RideCategory } from '@/types';

export interface VehicleSelectorProps {
  prices: Record<RideCategory, number>;
  etas?: Partial<Record<RideCategory, string>>;
  value: RideCategory;
  onChange: (category: RideCategory) => void;
  unavailable?: RideCategory[];
  loading?: boolean;
  label?: string;
  className?: string;
}

const CATEGORIES = Object.keys(VEHICLE_CATALOG) as RideCategory[];

/**
 * Défilement horizontal sur mobile ; sur desktop, la même rangée se centre naturellement
 * quand elle tient dans la largeur disponible (Phase 8 § 7) — pas de layout séparé à maintenir.
 */
export const VehicleSelector: React.FC<VehicleSelectorProps> = ({
  prices,
  etas,
  value,
  onChange,
  unavailable = [],
  loading = false,
  label = 'Catégorie de course',
  className,
}) => {
  if (loading) {
    return (
      <div className={cn('flex gap-3 overflow-x-auto pb-1', className)}>
        {CATEGORIES.map((cat) => (
          <VehicleOptionCardSkeleton key={cat} />
        ))}
      </div>
    );
  }

  return (
    <div role="radiogroup" aria-label={label} className={cn('flex gap-3 overflow-x-auto pb-1 lg:flex-wrap lg:justify-center', className)}>
      {CATEGORIES.map((cat) => (
        <motion.div key={cat} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          <VehicleOptionCard
            vehicle={VEHICLE_CATALOG[cat]}
            price={prices[cat]}
            eta={etas?.[cat]}
            selected={value === cat}
            unavailable={unavailable.includes(cat)}
            onSelect={() => onChange(cat)}
          />
        </motion.div>
      ))}
    </div>
  );
};
