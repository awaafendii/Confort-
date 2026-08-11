import type { User, UserRole } from '@/types/user';
import type { Driver, VehicleType, VehicleColorId } from '@/types/driver';

export type AuthAccount = User | Driver;

export interface RegisterVehicleInput {
  type: VehicleType;
  brand: string;
  model: string;
  plateNumber: string;
  color: VehicleColorId;
}

export interface RegisterInput {
  role: Extract<UserRole, 'PASSENGER' | 'DRIVER'>;
  name: string;
  phone: string;
  email: string;
  password: string;
  avatar?: string;
  vehicle?: RegisterVehicleInput;
}

export interface PendingRegistration {
  otp: string;
  input: RegisterInput;
  expiresAt: number;
}

export interface PendingReset {
  otp: string;
  identifier: string;
  expiresAt: number;
}
