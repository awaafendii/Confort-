import type { GeoPoint } from './common';
import type { PaymentMethod } from './payment';
import type { RideStatus } from './ride';

export type DeliveryMode = 'EXPRESS_MOTO' | 'STANDARD_VAN';
export type PackageSize = 'SMALL' | 'MEDIUM' | 'LARGE';

export interface DeliveryStop {
  label: string;
  address: string;
  coords: GeoPoint;
}

/**
 * Réutilise `RideStatus` (et donc `useTripSimulation` tel quel — aucune fourche du hook)
 * plutôt qu'un statut de livraison distinct : le déplacement d'un livreur vers un point de
 * collecte puis de livraison est mécaniquement identique à celui d'un chauffeur. Le libellé
 * ("Livreur" au lieu de "Chauffeur") reste une question d'affichage, gérée page par page.
 */
export interface Delivery {
  id: string;
  senderId: string;
  courierId?: string;
  pickup: DeliveryStop;
  dropoff: DeliveryStop;
  recipientName: string;
  recipientPhone: string;
  mode: DeliveryMode;
  packageSize: PackageSize;
  note?: string;
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
