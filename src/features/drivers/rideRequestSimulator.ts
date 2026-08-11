import { NEIGHBORHOODS } from '@/data/neighborhoods';
import { calculateFaresByCategory, calculateRouteEstimate } from '@/data/pricing';
import type { RideCategory, VehicleType } from '@/types';

export interface RideRequest {
  id: string;
  passengerName: string;
  passengerAvatar: string;
  passengerRating: number;
  passengerPhone: string;
  pickupId: string;
  destinationId: string;
  category: RideCategory;
  fare: number;
  distanceKm: number;
  durationMin: number;
}

const MOCK_PASSENGERS = [
  { name: 'Mariama Barry', seed: 'mariama', phone: '625114477' },
  { name: 'Alpha Condé', seed: 'alpha', phone: '628993311' },
  { name: 'Kadiatou Bah', seed: 'kadiatou', phone: '621556688' },
  { name: 'Sékou Kourouma', seed: 'sekou', phone: '629887744' },
];

function randomItem<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function randomCategory(vehicleType: VehicleType): RideCategory {
  if (vehicleType === 'MOTO') return 'MOTO_SINGLE';
  return randomItem<RideCategory>(['STANDARD', 'STANDARD', 'LUXE', 'VIP']);
}

/** Génère une demande de course plausible — simulation locale tant que le matching temps réel (Phase 6/11) n'existe pas. */
export function generateRideRequest(vehicleType: VehicleType): RideRequest {
  const pickup = randomItem(NEIGHBORHOODS);
  let destination = randomItem(NEIGHBORHOODS);
  while (destination.id === pickup.id) destination = randomItem(NEIGHBORHOODS);

  const category = randomCategory(vehicleType);
  const fare = calculateFaresByCategory(pickup.id, destination.id)[category];
  const { distanceKm, durationMin } = calculateRouteEstimate(pickup.id, destination.id, category);
  const passenger = randomItem(MOCK_PASSENGERS);

  return {
    id: `req-${Date.now()}`,
    passengerName: passenger.name,
    passengerAvatar: `https://i.pravatar.cc/150?u=${passenger.seed}`,
    passengerRating: Math.round((4.3 + Math.random() * 0.7) * 10) / 10,
    passengerPhone: passenger.phone,
    pickupId: pickup.id,
    destinationId: destination.id,
    category,
    fare,
    distanceKm,
    durationMin,
  };
}
