import type { RideCategory } from '@/types';

/**
 * Registre centralisé des visuels (Phase 8 § 27) — les composants lisent ces chemins, jamais une
 * chaîne codée en dur. Photos réelles (fournies par l'utilisateur, découpées depuis un plan
 * d'assets unique — voir `docs/` ou l'historique de session pour la source) pour vehicles/
 * services/campaigns. `placeholders/*` reste un vrai secours SVG sobre pour toute future entrée
 * qui n'aurait pas encore de visuel — remplacer une entrée = changer uniquement le chemin ici.
 */
export const VEHICLE_ASSETS: Record<RideCategory, string> = {
  STANDARD: '/assets/vehicles/standard.webp',
  LUXE: '/assets/vehicles/luxe.webp',
  VIP: '/assets/vehicles/vip.webp',
  MOTO_SINGLE: '/assets/vehicles/moto.webp',
};

/** 'ride' est le seul service réellement branché à un flux de réservation — les autres sont visuellement présents mais désactivés (voir ServiceCard `comingSoon`). */
export const SERVICE_ASSETS = {
  ride: '/assets/services/ride.webp',
  delivery: '/assets/services/delivery.webp',
  cargo: '/assets/services/cargo.webp',
  business: '/assets/services/business.webp',
  food: '/assets/services/food.webp',
  airport: '/assets/services/airport.webp',
} as const;

export const CAMPAIGN_ASSETS = {
  becomeDriver: '/assets/campaigns/become-driver.webp',
  safety: '/assets/campaigns/safety.webp',
  business: '/assets/campaigns/business.webp',
  delivery: '/assets/campaigns/delivery.webp',
  heroCity: '/assets/campaigns/hero-city.webp',
  phoneMockup: '/assets/campaigns/phone-mockup.webp',
} as const;

export const PLACEHOLDER_ASSETS = {
  vehicle: '/assets/placeholders/vehicle-placeholder.svg',
  campaign: '/assets/placeholders/campaign-placeholder.svg',
} as const;
