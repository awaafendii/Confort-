import type { PaymentMethod, Ride, RideCategory } from '@/types';
import { getNeighborhood } from './neighborhoods';

function stop(id: string) {
  const n = getNeighborhood(id)!;
  return { label: n.name, address: `${n.name}, Conakry`, coords: n.coords };
}

function hoursAgo(hours: number): string {
  const d = new Date();
  d.setHours(d.getHours() - hours);
  return d.toISOString();
}

function daysAgoAt(days: number, hour: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

const HISTORY_NEIGHBORHOODS = ['kaloum', 'madina', 'aeroport', 'sangoyah', 'dabompa', 'km36', 'dixinn', 'hamdallaye', 'citerail', 't6', 't8', 'kagbelen'];
const HISTORY_USERS = ['demo-passenger', 'u-2', 'u-3', 'u-4', 'u-5', 'u-6', 'u-7', 'u-8', 'u-9', 'u-10'];
const HISTORY_DRIVERS = ['demo-driver', 'md-1', 'md-2', 'md-3', 'md-4'];
const HISTORY_CATEGORIES: RideCategory[] = ['STANDARD', 'LUXE', 'VIP', 'MOTO_SINGLE'];
const HISTORY_PAYMENTS: PaymentMethod[] = ['ESPECE', 'ORANGE_MONEY', 'MOMO'];

/**
 * Historique déterministe sur ~89 jours (1-2 courses/jour) pour alimenter honnêtement le
 * sélecteur de période et le graphique d'activité du Dashboard admin (§7.1) — sans lui, "7
 * derniers jours"/"30 derniers jours" n'auraient eu que les ~10 courses du jour à afficher.
 * Étendu à ~3 mois pour le préréglage "3 mois" d'Analytics (§7.7).
 */
function buildHistoricalRides(): Ride[] {
  const rides: Ride[] = [];
  for (let day = 2; day <= 89; day++) {
    const ridesPerDay = 1 + (day % 2);
    for (let i = 0; i < ridesPerDay; i++) {
      const idx = day * 3 + i;
      const category = HISTORY_CATEGORIES[idx % HISTORY_CATEGORIES.length];
      const cancelled = idx % 9 === 0;
      const distanceKm = 2 + (idx % 5);
      const durationMin = category === 'MOTO_SINGLE' ? Math.round(distanceKm * 2) : distanceKm * 3;
      const fareBase = 2500 + (idx % 6) * 500;
      const fare =
        category === 'MOTO_SINGLE' ? fareBase * 5 : category === 'VIP' ? fareBase + 5000 : category === 'LUXE' ? Math.max(0, fareBase - 500) : fareBase;
      const requestedAt = daysAgoAt(day, 7 + i * 4);
      rides.push({
        id: `pride-h${day}-${i}`,
        passengerId: HISTORY_USERS[idx % HISTORY_USERS.length],
        driverId: HISTORY_DRIVERS[idx % HISTORY_DRIVERS.length],
        pickup: stop(HISTORY_NEIGHBORHOODS[idx % HISTORY_NEIGHBORHOODS.length]),
        destination: stop(HISTORY_NEIGHBORHOODS[(idx + 4) % HISTORY_NEIGHBORHOODS.length]),
        category,
        vehicleType: category === 'MOTO_SINGLE' ? 'MOTO' : 'VOITURE',
        status: cancelled ? 'CANCELLED' : 'COMPLETED',
        distanceKm,
        durationMin,
        fare,
        currency: 'GNF',
        paymentMethod: HISTORY_PAYMENTS[idx % HISTORY_PAYMENTS.length],
        requestedAt,
        completedAt: cancelled ? undefined : requestedAt,
        rating: cancelled ? undefined : 3 + (idx % 3),
      });
    }
  }
  return rides;
}

/** Vue plateforme des courses récentes — indépendante des historiques par rôle, pour l'aperçu admin. */
const TODAY_RIDES: Ride[] = [
  { id: 'pride-1', passengerId: 'demo-passenger', driverId: 'demo-driver', pickup: stop('kaloum'), destination: stop('madina'), category: 'STANDARD', vehicleType: 'VOITURE', status: 'COMPLETED', distanceKm: 2.6, durationMin: 8, fare: 3000, currency: 'GNF', paymentMethod: 'ORANGE_MONEY', requestedAt: hoursAgo(1), completedAt: hoursAgo(1), rating: 5 },
  { id: 'pride-2', passengerId: 'u-2', driverId: 'md-2', pickup: stop('dixinn'), destination: stop('hamdallaye'), category: 'LUXE', vehicleType: 'VOITURE', status: 'COMPLETED', distanceKm: 2.6, durationMin: 8, fare: 2500, currency: 'GNF', paymentMethod: 'MOMO', requestedAt: hoursAgo(3), completedAt: hoursAgo(3), rating: 4 },
  { id: 'pride-3', passengerId: 'u-3', driverId: 'md-4', pickup: stop('hamdallaye'), destination: stop('citerail'), category: 'MOTO_SINGLE', vehicleType: 'MOTO', status: 'COMPLETED', distanceKm: 2.6, durationMin: 6, fare: 20000, currency: 'GNF', paymentMethod: 'ESPECE', requestedAt: hoursAgo(4), completedAt: hoursAgo(4), rating: 5 },
  { id: 'pride-4', passengerId: 'u-4', driverId: 'md-1', pickup: stop('kaloum'), destination: stop('dixinn'), category: 'VIP', vehicleType: 'VOITURE', status: 'IN_PROGRESS', distanceKm: 2.6, durationMin: 8, fare: 8000, currency: 'GNF', paymentMethod: 'ORANGE_MONEY', requestedAt: hoursAgo(0) },
  { id: 'pride-5', passengerId: 'u-5', driverId: 'md-3', pickup: stop('aeroport'), destination: stop('sangoyah'), category: 'STANDARD', vehicleType: 'VOITURE', status: 'COMPLETED', distanceKm: 2.6, durationMin: 8, fare: 3000, currency: 'GNF', paymentMethod: 'ESPECE', requestedAt: hoursAgo(6), completedAt: hoursAgo(6), rating: 5 },
  { id: 'pride-6', passengerId: 'u-6', driverId: 'md-2', pickup: stop('t6'), destination: stop('t8'), category: 'STANDARD', vehicleType: 'VOITURE', status: 'CANCELLED', distanceKm: 2.6, durationMin: 8, fare: 4000, currency: 'GNF', paymentMethod: 'MOMO', requestedAt: hoursAgo(8) },
  { id: 'pride-7', passengerId: 'u-7', driverId: 'demo-driver', pickup: stop('madina'), destination: stop('aeroport'), category: 'LUXE', vehicleType: 'VOITURE', status: 'COMPLETED', distanceKm: 2.0, durationMin: 6, fare: 1500, currency: 'GNF', paymentMethod: 'ORANGE_MONEY', requestedAt: hoursAgo(10), completedAt: hoursAgo(10), rating: 4 },
  { id: 'pride-8', passengerId: 'u-8', driverId: 'md-4', pickup: stop('citerail'), destination: stop('t6'), category: 'MOTO_SINGLE', vehicleType: 'MOTO', status: 'COMPLETED', distanceKm: 4.0, durationMin: 5, fare: 20000, currency: 'GNF', paymentMethod: 'ESPECE', requestedAt: hoursAgo(14), completedAt: hoursAgo(14), rating: 3 },
  { id: 'pride-9', passengerId: 'u-9', driverId: 'md-1', pickup: stop('kaloum'), destination: stop('madina'), category: 'STANDARD', vehicleType: 'VOITURE', status: 'CANCELLED', distanceKm: 2.6, durationMin: 8, fare: 3000, currency: 'GNF', paymentMethod: 'ESPECE', requestedAt: hoursAgo(20) },
  { id: 'pride-10', passengerId: 'u-10', driverId: 'md-3', pickup: stop('dabompa'), destination: stop('km36'), category: 'STANDARD', vehicleType: 'VOITURE', status: 'COMPLETED', distanceKm: 6.0, durationMin: 15, fare: 4000, currency: 'GNF', paymentMethod: 'MOMO', requestedAt: hoursAgo(26), completedAt: hoursAgo(26), rating: 5 },
];

export const MOCK_PLATFORM_RIDES: Ride[] = [...TODAY_RIDES, ...buildHistoricalRides()];
