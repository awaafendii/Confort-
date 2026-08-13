import type { User } from './user';
import type { GeoPoint } from './common';

export type VehicleType = 'VOITURE' | 'MOTO';

/**
 * Couleur réelle du véhicule — utilisée pour la simulation temps réel des
 * commandes sur la carte (marqueurs colorés façon Yango/Dakar).
 * Voir src/data/vehicleColors.ts pour la palette complète.
 */
export type VehicleColorId =
  | 'blanc'
  | 'noir'
  | 'gris'
  | 'argent'
  | 'rouge'
  | 'bleu'
  | 'vert'
  | 'beige';

export type DriverStatus = 'ONLINE' | 'OFFLINE' | 'ON_TRIP';

export type DriverVerificationStatus = 'PENDING' | 'VERIFIED' | 'SUSPENDED';

export interface Vehicle {
  id: string;
  driverId: string;
  type: VehicleType;
  brand: string;
  model: string;
  plateNumber: string;
  color: VehicleColorId;
  year?: number;
}

export interface DriverDocument {
  type: 'PERMIS' | 'CARTE_IDENTITE' | 'CARTE_GRISE' | 'ASSURANCE';
  url: string;
  status: 'PENDING' | 'VALIDATED' | 'REJECTED';
  /** Motif affiché au chauffeur quand `status` vaut `REJECTED`. */
  rejectionReason?: string;
}

export interface Driver extends User {
  role: 'DRIVER';
  vehicle: Vehicle;
  status: DriverStatus;
  verification: DriverVerificationStatus;
  rating: number;
  tripsCompleted: number;
  acceptanceRate: number;
  earningsToday: number;
  location: GeoPoint;
  heading?: number;
  documents: DriverDocument[];
}
