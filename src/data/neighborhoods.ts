import type { Neighborhood } from '@/types';

/**
 * Quartiers desservis à Conakry — portés depuis la configuration WONKHAI.
 * Les coordonnées sont des approximations WGS84 le long de la presqu'île
 * de Conakry (Kaloum -> Km36 via l'Autoroute, et Kaloum -> Kagbélén via
 * la route du Niger/Prince). À affiner avec un géocodage précis en Phase 6
 * lors du branchement Mapbox réel.
 */
export const NEIGHBORHOODS: Neighborhood[] = [
  { id: 'kaloum', name: 'Kaloum', coords: { lat: 9.5092, lng: -13.7122 } },
  { id: 'madina', name: 'Madina', coords: { lat: 9.5451, lng: -13.6801 } },
  { id: 'aeroport', name: 'Aéroport - Gbessia', coords: { lat: 9.5769, lng: -13.612 } },
  { id: 'sangoyah', name: 'Sangoyah', coords: { lat: 9.601, lng: -13.585 } },
  { id: 'dabompa', name: 'Dabompa', coords: { lat: 9.63, lng: -13.552 } },
  { id: 'km36', name: 'KM36', coords: { lat: 9.752, lng: -13.492 } },
  { id: 'dixinn', name: 'Dixinn', coords: { lat: 9.5353, lng: -13.6782 } },
  { id: 'hamdallaye', name: 'Hamdallaye', coords: { lat: 9.5571, lng: -13.6432 } },
  { id: 'citerail', name: 'Cité-Rail', coords: { lat: 9.577, lng: -13.623 } },
  { id: 't6', name: 'T6 Sonfonia', coords: { lat: 9.612, lng: -13.586 } },
  { id: 't8', name: 'T8', coords: { lat: 9.631, lng: -13.551 } },
  { id: 'kagbelen', name: 'Kagbélén', coords: { lat: 9.652, lng: -13.519 } },
];

export const getNeighborhood = (id: string): Neighborhood | undefined =>
  NEIGHBORHOODS.find((n) => n.id === id);

/** Centre de carte par défaut (Kaloum, centre historique de Conakry). */
export const CONAKRY_MAP_CENTER = { lat: 9.537, lng: -13.6773 };
