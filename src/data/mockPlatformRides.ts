import type { Ride } from '@/types';
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

/** Vue plateforme des courses récentes — indépendante des historiques par rôle, pour l'aperçu admin. */
export const MOCK_PLATFORM_RIDES: Ride[] = [
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
