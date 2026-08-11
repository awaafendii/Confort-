import type { RideCategory } from '@/types';

/**
 * Configuration tarifaire — source de vérité portée depuis le projet
 * WONKHAI existant (App.tsx). Ne pas modifier les montants sans validation
 * métier : ils reflètent la grille tarifaire déjà en usage sur Conakry.
 *
 * Le réseau est modélisé comme deux axes de quartiers consécutifs ;
 * le prix d'un trajet est la somme des tronçons parcourus le long de
 * l'axe. Si origine et destination ne sont pas sur le même axe, le
 * trajet transite par Kaloum (hub central).
 */
const AXE_AUTOROUTE = ['kaloum', 'madina', 'aeroport', 'sangoyah', 'dabompa', 'km36'] as const;
const PRICES_AUTOROUTE: Record<string, number> = {
  'kaloum-madina': 3000,
  'madina-aeroport': 2000,
  'aeroport-sangoyah': 3000,
  'sangoyah-dabompa': 3000,
  'dabompa-km36': 4000,
};

const AXE_PRINCE = ['kaloum', 'dixinn', 'hamdallaye', 'citerail', 't6', 't8', 'kagbelen'] as const;
const PRICES_PRINCE: Record<string, number> = {
  'kaloum-dixinn': 3000,
  'dixinn-hamdallaye': 2000,
  'hamdallaye-citerail': 4000,
  'citerail-t6': 4000,
  't6-t8': 4000,
  't8-kagbelen': 4000,
};

const DEFAULT_FARE = 3000;

function calculatePathMetrics(
  axe: readonly string[],
  prices: Record<string, number>,
  origin: string,
  dest: string
): { price: number; hops: number } {
  const idxO = axe.indexOf(origin);
  const idxD = axe.indexOf(dest);
  if (idxO === -1 || idxD === -1) return { price: 0, hops: 0 };
  const start = Math.min(idxO, idxD);
  const end = Math.max(idxO, idxD);
  let price = 0;
  for (let i = start; i < end; i++) {
    const key = `${axe[i]}-${axe[i + 1]}`;
    const reverseKey = `${axe[i + 1]}-${axe[i]}`;
    price += prices[key] || prices[reverseKey] || 0;
  }
  return { price, hops: end - start };
}

function routeMetrics(originId: string, destId: string): { price: number; hops: number } {
  const auto = calculatePathMetrics(AXE_AUTOROUTE, PRICES_AUTOROUTE, originId, destId);
  if (auto.price > 0) return auto;

  const prince = calculatePathMetrics(AXE_PRINCE, PRICES_PRINCE, originId, destId);
  if (prince.price > 0) return prince;

  const toKaloumAuto = calculatePathMetrics(AXE_AUTOROUTE, PRICES_AUTOROUTE, originId, 'kaloum');
  const toKaloum = toKaloumAuto.price > 0 ? toKaloumAuto : calculatePathMetrics(AXE_PRINCE, PRICES_PRINCE, originId, 'kaloum');
  const fromKaloumAuto = calculatePathMetrics(AXE_AUTOROUTE, PRICES_AUTOROUTE, 'kaloum', destId);
  const fromKaloum = fromKaloumAuto.price > 0 ? fromKaloumAuto : calculatePathMetrics(AXE_PRINCE, PRICES_PRINCE, 'kaloum', destId);
  const price = toKaloum.price + fromKaloum.price;
  const hops = toKaloum.hops + fromKaloum.hops;

  return price > 0 ? { price, hops } : { price: DEFAULT_FARE, hops: 1 };
}

/** Tarif STANDARD (voiture, partagé) pour un trajet entre deux quartiers. */
export function calculateStandardFare(originId: string, destId: string): number {
  return routeMetrics(originId, destId).price;
}

/**
 * Estimation de distance/durée affichable — dérivée du nombre de tronçons
 * du trajet (le même graphe que la tarification). Purement indicative tant
 * que le routage Mapbox réel n'est pas branché (Phase 6).
 */
export function calculateRouteEstimate(
  originId: string,
  destId: string,
  category: RideCategory = 'STANDARD'
): { distanceKm: number; durationMin: number } {
  const { hops } = routeMetrics(originId, destId);
  const safeHops = Math.max(hops, 1);
  const distanceKm = Math.round(safeHops * 2.6 * 10) / 10;
  const baseDurationMin = safeHops * 5 + 3;
  const durationMin = Math.round(category === 'MOTO_SINGLE' ? baseDurationMin * 0.7 : baseDurationMin);
  return { distanceKm, durationMin };
}

function pathSlice(axe: readonly string[], origin: string, dest: string): string[] | null {
  const idxO = axe.indexOf(origin);
  const idxD = axe.indexOf(dest);
  if (idxO === -1 || idxD === -1) return null;
  const slice = axe.slice(Math.min(idxO, idxD), Math.max(idxO, idxD) + 1);
  return idxO <= idxD ? [...slice] : [...slice].reverse();
}

/**
 * Séquence de quartiers traversés entre deux points — même graphe que la
 * tarification. Utilisée pour dessiner un tracé plausible sur la carte
 * (Phase 6) en l'absence d'un service de routage réel (Directions API).
 */
export function getNeighborhoodPath(originId: string, destId: string): string[] {
  if (originId === destId) return [originId];

  const auto = pathSlice(AXE_AUTOROUTE, originId, destId);
  if (auto) return auto;

  const prince = pathSlice(AXE_PRINCE, originId, destId);
  if (prince) return prince;

  const toKaloum = pathSlice(AXE_AUTOROUTE, originId, 'kaloum') ?? pathSlice(AXE_PRINCE, originId, 'kaloum') ?? [originId, 'kaloum'];
  const fromKaloum = pathSlice(AXE_AUTOROUTE, 'kaloum', destId) ?? pathSlice(AXE_PRINCE, 'kaloum', destId) ?? ['kaloum', destId];
  return [...toKaloum, ...fromKaloum.slice(1)];
}

/** Tarifs de toutes les catégories pour un trajet donné. */
export function calculateFaresByCategory(originId: string, destId: string): Record<RideCategory, number> {
  const standard = calculateStandardFare(originId, destId);
  return {
    STANDARD: standard,
    LUXE: Math.max(0, standard - 500),
    VIP: standard + 5000,
    MOTO_SINGLE: standard * 5,
  };
}

export const RIDE_CATEGORIES_CONFIG: Record<RideCategory, { label: string; capacity: string; description: string }> = {
  STANDARD: { label: 'Standard', capacity: '4 pers. max', description: 'Partagé, arrêts publics.' },
  LUXE: { label: 'Luxe', capacity: '3 pers. max', description: 'Confort, -500 FG.' },
  VIP: { label: 'VIP', capacity: 'Seul à bord', description: 'Trajet privé, +5 000 FG.' },
  MOTO_SINGLE: { label: 'Moto-Taxi', capacity: '1 pers. max', description: 'Rapide, tarif x5.' },
};
