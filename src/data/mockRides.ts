import type { Ride } from '@/types';
import { getNeighborhood } from './neighborhoods';

function stop(id: string) {
  const n = getNeighborhood(id)!;
  return { label: n.name, address: `${n.name}, Conakry`, coords: n.coords };
}

function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

/** Historique de démonstration — passager démo (622000001). */
export const SEED_RIDE_HISTORY: Ride[] = [
  {
    id: 'ride-1',
    passengerId: 'demo-passenger',
    driverId: 'md-1',
    pickup: stop('kaloum'),
    destination: stop('madina'),
    category: 'STANDARD',
    vehicleType: 'VOITURE',
    status: 'COMPLETED',
    distanceKm: 2.6,
    durationMin: 8,
    fare: 3000,
    currency: 'GNF',
    paymentMethod: 'ORANGE_MONEY',
    requestedAt: daysAgo(1),
    completedAt: daysAgo(1),
    rating: 5,
  },
  {
    id: 'ride-2',
    passengerId: 'demo-passenger',
    driverId: 'md-4',
    pickup: stop('hamdallaye'),
    destination: stop('citerail'),
    category: 'MOTO_SINGLE',
    vehicleType: 'MOTO',
    status: 'COMPLETED',
    distanceKm: 2.6,
    durationMin: 6,
    fare: 20000,
    currency: 'GNF',
    paymentMethod: 'ESPECE',
    requestedAt: daysAgo(3),
    completedAt: daysAgo(3),
    rating: 4,
  },
  {
    id: 'ride-3',
    passengerId: 'demo-passenger',
    driverId: 'md-2',
    pickup: stop('kaloum'),
    destination: stop('dixinn'),
    category: 'VIP',
    vehicleType: 'VOITURE',
    status: 'COMPLETED',
    distanceKm: 2.6,
    durationMin: 8,
    fare: 8000,
    currency: 'GNF',
    paymentMethod: 'MOMO',
    requestedAt: daysAgo(6),
    completedAt: daysAgo(6),
    rating: 5,
  },
  {
    id: 'ride-4',
    passengerId: 'demo-passenger',
    driverId: 'md-3',
    pickup: stop('aeroport'),
    destination: stop('kaloum'),
    category: 'LUXE',
    vehicleType: 'VOITURE',
    status: 'CANCELLED',
    distanceKm: 5.2,
    durationMin: 13,
    fare: 4500,
    currency: 'GNF',
    paymentMethod: 'ESPECE',
    requestedAt: daysAgo(9),
  },
];
