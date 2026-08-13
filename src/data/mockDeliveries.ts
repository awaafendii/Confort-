import type { Delivery } from '@/types';
import { getNeighborhood } from './neighborhoods';
import { calculateDeliveryFare } from './deliveryPricing';

function stop(id: string) {
  const n = getNeighborhood(id)!;
  return { label: n.name, address: `${n.name}, Conakry`, coords: n.coords };
}

function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

/** Historique de démonstration — passager démo (622000001), même principe que mockRides.ts. */
export const SEED_DELIVERY_HISTORY: Delivery[] = [
  {
    id: 'delivery-1',
    senderId: 'demo-passenger',
    courierId: 'md-4',
    pickup: stop('kaloum'),
    dropoff: stop('madina'),
    recipientName: 'Fatoumata Sylla',
    recipientPhone: '620774411',
    mode: 'EXPRESS_MOTO',
    packageSize: 'SMALL',
    status: 'COMPLETED',
    distanceKm: 2.6,
    durationMin: 6,
    fare: calculateDeliveryFare('kaloum', 'madina', 'EXPRESS_MOTO', 'SMALL'),
    currency: 'GNF',
    paymentMethod: 'ORANGE_MONEY',
    requestedAt: daysAgo(3),
    completedAt: daysAgo(3),
    rating: 5,
  },
];
