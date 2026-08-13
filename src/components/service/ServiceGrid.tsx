import React from 'react';
import { ServiceCard, type ServiceItem } from './ServiceCard';
import { cn } from '@/lib/utils';

export interface ServiceGridProps {
  services: ServiceItem[];
  onSelect?: (service: ServiceItem) => void;
  /** true dans un conteneur étroit (ex. sidebar desktop) — les breakpoints Tailwind réagissent à la largeur du viewport, pas du conteneur, donc `lg:grid-cols-5` déborderait dans une colonne de 400px même sur un grand écran. */
  compact?: boolean;
  className?: string;
}

/** 2 colonnes mobile, jusqu'à 5 en desktop large (Phase 8 § 9). */
export const ServiceGrid: React.FC<ServiceGridProps> = ({ services, onSelect, compact = false, className }) => (
  <div className={cn('grid grid-cols-2 gap-3', !compact && 'sm:grid-cols-3 lg:grid-cols-5', className)}>
    {services.map((service) => (
      <ServiceCard key={service.id} service={service} onSelect={service.comingSoon ? undefined : () => onSelect?.(service)} />
    ))}
  </div>
);
