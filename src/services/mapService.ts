import { NEIGHBORHOODS, getNeighborhood } from '@/data/neighborhoods';
import { calculateRouteEstimate, getNeighborhoodPath } from '@/data/pricing';
import type { GeoPoint, VehicleColorId } from '@/types';

/**
 * Abstraction cartographique — découple l'application du fournisseur.
 * Implémentation par défaut : MapLibre GL + tuiles vectorielles gratuites
 * OpenFreeMap (aucune clé requise). Un provider Mapbox réel pourra être
 * ajouté plus tard (il suffira d'un token) sans toucher aux écrans qui
 * consomment ce service.
 */

export type MapProviderId = 'maplibre' | 'mapbox' | 'google';

export interface VehicleMarker {
  id: string;
  position: GeoPoint;
  heading?: number;
  color: VehicleColorId;
  vehicleType: 'VOITURE' | 'MOTO';
}

export interface RouteResult {
  distanceKm: number;
  durationMin: number;
  geometry: GeoPoint[];
}

export interface MapService {
  readonly provider: MapProviderId;
  getRoute(origin: GeoPoint, destination: GeoPoint): Promise<RouteResult>;
  geocode(query: string): Promise<Array<{ label: string; address: string; coords: GeoPoint }>>;
  reverseGeocode(point: GeoPoint): Promise<string>;
}

function nearestNeighborhoodId(point: GeoPoint): string {
  let bestId = NEIGHBORHOODS[0].id;
  let bestDist = Infinity;
  for (const n of NEIGHBORHOODS) {
    const d = (n.coords.lat - point.lat) ** 2 + (n.coords.lng - point.lng) ** 2;
    if (d < bestDist) {
      bestDist = d;
      bestId = n.id;
    }
  }
  return bestId;
}

/**
 * Implémentation MapLibre — le routage/géocodage restent basés sur le
 * graphe de quartiers (src/data/pricing.ts), pas sur une vraie Directions
 * API : cohérent avec les tarifs déjà affichés partout ailleurs dans
 * l'app, et ne nécessite aucune clé.
 */
class MapLibreMapService implements MapService {
  readonly provider: MapProviderId = 'maplibre';

  async getRoute(origin: GeoPoint, destination: GeoPoint): Promise<RouteResult> {
    const originId = nearestNeighborhoodId(origin);
    const destId = nearestNeighborhoodId(destination);
    const geometry = getNeighborhoodPath(originId, destId).map((id) => getNeighborhood(id)!.coords);
    const { distanceKm, durationMin } = calculateRouteEstimate(originId, destId);
    return { distanceKm, durationMin, geometry };
  }

  async geocode(query: string) {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return NEIGHBORHOODS.filter((n) => n.name.toLowerCase().includes(q)).map((n) => ({
      label: n.name,
      address: `${n.name}, Conakry`,
      coords: n.coords,
    }));
  }

  async reverseGeocode(point: GeoPoint): Promise<string> {
    return getNeighborhood(nearestNeighborhoodId(point))!.name;
  }
}

export function createMapService(provider: MapProviderId = 'maplibre'): MapService {
  if (provider === 'maplibre') return new MapLibreMapService();
  throw new Error(`MapService[${provider}] n'est pas implémenté — seul 'maplibre' (gratuit, sans clé) l'est pour le moment.`);
}
