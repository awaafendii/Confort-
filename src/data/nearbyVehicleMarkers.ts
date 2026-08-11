import { MOCK_DRIVERS_POOL } from './mockDrivers';
import { NEIGHBORHOODS } from './neighborhoods';
import { VEHICLE_COLORS } from './vehicleColors';
import type { MapMarkerSpec } from '@/components/map/MapView';

/**
 * Marqueurs de véhicules dispersés sur Conakry pour l'aperçu carte des
 * accueils passager/chauffeur (effet "plein de voitures colorées" façon
 * Yango). Positions calculées une fois au chargement du module — stables
 * pendant la session, pas de saut à chaque rendu.
 */
export const NEARBY_VEHICLE_MARKERS: MapMarkerSpec[] = MOCK_DRIVERS_POOL.map((driver, i) => {
  const anchor = NEIGHBORHOODS[(i * 3) % NEIGHBORHOODS.length].coords;
  const jitter = () => (Math.random() - 0.5) * 0.012;
  return {
    id: driver.id,
    kind: 'vehicle',
    position: { lat: anchor.lat + jitter(), lng: anchor.lng + jitter() },
    color: VEHICLE_COLORS[driver.vehicle.color].hex,
    vehicleType: driver.vehicle.type,
  };
});
