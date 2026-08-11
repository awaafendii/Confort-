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

/** Historique de démonstration — chauffeur démo (622001122, Mamadou Bah). */
export const MOCK_DRIVER_RIDES: Ride[] = [
  {
    id: 'dride-1',
    passengerId: 'demo-passenger',
    driverId: 'demo-driver',
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
    requestedAt: daysAgo(0),
    completedAt: daysAgo(0),
    rating: 5,
  },
  {
    id: 'dride-2',
    passengerId: 'u-2',
    driverId: 'demo-driver',
    pickup: stop('dixinn'),
    destination: stop('hamdallaye'),
    category: 'LUXE',
    vehicleType: 'VOITURE',
    status: 'COMPLETED',
    distanceKm: 2.6,
    durationMin: 8,
    fare: 2500,
    currency: 'GNF',
    paymentMethod: 'MOMO',
    requestedAt: daysAgo(0),
    completedAt: daysAgo(0),
    rating: 4,
  },
  {
    id: 'dride-3',
    passengerId: 'u-3',
    driverId: 'demo-driver',
    pickup: stop('kaloum'),
    destination: stop('dixinn'),
    category: 'VIP',
    vehicleType: 'VOITURE',
    status: 'COMPLETED',
    distanceKm: 2.6,
    durationMin: 8,
    fare: 8000,
    currency: 'GNF',
    paymentMethod: 'ESPECE',
    requestedAt: daysAgo(1),
    completedAt: daysAgo(1),
    rating: 5,
  },
  {
    id: 'dride-4',
    passengerId: 'u-4',
    driverId: 'demo-driver',
    pickup: stop('aeroport'),
    destination: stop('sangoyah'),
    category: 'STANDARD',
    vehicleType: 'VOITURE',
    status: 'COMPLETED',
    distanceKm: 2.6,
    durationMin: 8,
    fare: 3000,
    currency: 'GNF',
    paymentMethod: 'ESPECE',
    requestedAt: daysAgo(2),
    completedAt: daysAgo(2),
    rating: 5,
  },
];
