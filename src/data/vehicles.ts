import { RIDE_CATEGORIES_CONFIG } from './pricing';
import { VEHICLE_ASSETS } from '@/config/assets';
import type { RideCategory } from '@/types';

export interface VehicleCatalogEntry {
  category: RideCategory;
  name: string;
  description: string;
  capacity: string;
  image: string;
  badge?: string;
}

/**
 * Catalogue visuel des catégories de course — étend `RIDE_CATEGORIES_CONFIG` (source de
 * vérité du label/capacité/description, pricing.ts) avec les champs propres à la Phase 8
 * (image, badge). Volontairement SANS champ `price` : le tarif dépend de la distance réelle
 * entre deux points (`calculateFares`), jamais d'un prix fixe par catégorie — les composants
 * qui affichent un prix continuent de le calculer à la volée, pas depuis ce catalogue.
 */
export const VEHICLE_CATALOG: Record<RideCategory, VehicleCatalogEntry> = {
  STANDARD: {
    category: 'STANDARD',
    name: RIDE_CATEGORIES_CONFIG.STANDARD.label,
    description: RIDE_CATEGORIES_CONFIG.STANDARD.description,
    capacity: RIDE_CATEGORIES_CONFIG.STANDARD.capacity,
    image: VEHICLE_ASSETS.STANDARD,
  },
  LUXE: {
    category: 'LUXE',
    name: RIDE_CATEGORIES_CONFIG.LUXE.label,
    description: RIDE_CATEGORIES_CONFIG.LUXE.description,
    capacity: RIDE_CATEGORIES_CONFIG.LUXE.capacity,
    image: VEHICLE_ASSETS.LUXE,
  },
  VIP: {
    category: 'VIP',
    name: RIDE_CATEGORIES_CONFIG.VIP.label,
    description: RIDE_CATEGORIES_CONFIG.VIP.description,
    capacity: RIDE_CATEGORIES_CONFIG.VIP.capacity,
    image: VEHICLE_ASSETS.VIP,
    badge: 'Premium',
  },
  MOTO_SINGLE: {
    category: 'MOTO_SINGLE',
    name: RIDE_CATEGORIES_CONFIG.MOTO_SINGLE.label,
    description: RIDE_CATEGORIES_CONFIG.MOTO_SINGLE.description,
    capacity: RIDE_CATEGORIES_CONFIG.MOTO_SINGLE.capacity,
    image: VEHICLE_ASSETS.MOTO_SINGLE,
    badge: 'Rapide',
  },
};
