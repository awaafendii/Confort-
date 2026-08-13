import { calculateRouteEstimate, calculateStandardFare } from './pricing';
import type { DeliveryMode, PackageSize } from '@/types';

/** Réutilise le même graphe quartier-à-quartier que les courses (pricing.ts) — un colis parcourt la même distance qu'une personne entre deux points. */
export const DELIVERY_MODES_CONFIG: Record<DeliveryMode, { label: string; description: string; multiplier: number }> = {
  EXPRESS_MOTO: { label: 'Express (Moto)', description: 'Livraison rapide, petits colis.', multiplier: 1 },
  STANDARD_VAN: { label: 'Standard (Fourgon)', description: 'Colis volumineux, délai plus long.', multiplier: 1.6 },
};

export const PACKAGE_SIZE_CONFIG: Record<PackageSize, { label: string; description: string; surcharge: number }> = {
  SMALL: { label: 'Petit', description: 'Sac, enveloppe, pochette.', surcharge: 0 },
  MEDIUM: { label: 'Moyen', description: 'Carton, sac de courses.', surcharge: 1500 },
  LARGE: { label: 'Grand', description: 'Meuble, électroménager.', surcharge: 4000 },
};

export function calculateDeliveryFare(pickupId: string, dropoffId: string, mode: DeliveryMode, size: PackageSize): number {
  const base = calculateStandardFare(pickupId, dropoffId);
  return Math.round(base * DELIVERY_MODES_CONFIG[mode].multiplier) + PACKAGE_SIZE_CONFIG[size].surcharge;
}

export function calculateDeliveryFaresByMode(pickupId: string, dropoffId: string, size: PackageSize): Record<DeliveryMode, number> {
  return {
    EXPRESS_MOTO: calculateDeliveryFare(pickupId, dropoffId, 'EXPRESS_MOTO', size),
    STANDARD_VAN: calculateDeliveryFare(pickupId, dropoffId, 'STANDARD_VAN', size),
  };
}

export function calculateDeliveryEstimate(pickupId: string, dropoffId: string, mode: DeliveryMode) {
  const { distanceKm, durationMin } = calculateRouteEstimate(pickupId, dropoffId, mode === 'EXPRESS_MOTO' ? 'MOTO_SINGLE' : 'STANDARD');
  return { distanceKm, durationMin };
}
