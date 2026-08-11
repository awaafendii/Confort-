import type { GeoPoint } from './common';
import type { PaymentMethod } from './payment';
import type { VehicleType } from './driver';

/** Catégories de course — clés alignées sur src/data/pricing.ts (WONKHAI). */
export type RideCategory = 'STANDARD' | 'LUXE' | 'VIP' | 'MOTO_SINGLE';

/**
 * Machine d'état d'une course. Les transitions valides sont décrites par
 * RIDE_STATUS_TRANSITIONS ci-dessous — toute mutation de statut doit passer
 * par cette table pour rester cohérente (utilisé en Phase 4/6).
 */
export type RideStatus =
  | 'REQUESTED'
  | 'SEARCHING_DRIVER'
  | 'DRIVER_ASSIGNED'
  | 'DRIVER_ARRIVING'
  | 'DRIVER_ARRIVED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export const RIDE_STATUS_TRANSITIONS: Record<RideStatus, RideStatus[]> = {
  REQUESTED: ['SEARCHING_DRIVER', 'CANCELLED'],
  SEARCHING_DRIVER: ['DRIVER_ASSIGNED', 'CANCELLED'],
  DRIVER_ASSIGNED: ['DRIVER_ARRIVING', 'CANCELLED'],
  DRIVER_ARRIVING: ['DRIVER_ARRIVED', 'CANCELLED'],
  DRIVER_ARRIVED: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['COMPLETED'],
  COMPLETED: [],
  CANCELLED: [],
};

export interface RideStop {
  label: string;
  address: string;
  coords: GeoPoint;
}

export interface Ride {
  id: string;
  passengerId: string;
  driverId?: string;
  pickup: RideStop;
  destination: RideStop;
  category: RideCategory;
  vehicleType: VehicleType;
  status: RideStatus;
  distanceKm: number;
  durationMin: number;
  fare: number;
  currency: 'GNF';
  paymentMethod: PaymentMethod;
  requestedAt: string;
  completedAt?: string;
  rating?: number;
  ratingComment?: string;
  tip?: number;
}
