
export type UserRole = 'CLIENT' | 'DRIVER' | 'ADMIN';

export type VehicleType = 'VOITURE' | 'MOTO';

export type RideCategory = 'STANDARD' | 'LUXE' | 'VIP' | 'MOTO_SINGLE';

export type MapViewMode = 'STREET' | 'SATELLITE' | 'STANDARD';

export type PaymentMethod = 'ESPECE' | 'PAYCARD' | 'KULU' | 'VISA' | 'ORANGE_MONEY' | 'WAVE';

export type RideStatus = 'SEARCHING' | 'ACCEPTED' | 'EN_ROUTE' | 'COMPLETED' | 'CANCELLED';

export type SubscriptionStatus = 'ACTIVE' | 'EXPIRED' | 'PENDING';

export type TransactionType = 'DEBIT' | 'CREDIT';

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: TransactionType;
  method: PaymentMethod;
  description: string;
  date: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
}

export interface Neighborhood {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  avatar?: string;
  balance: number;
  createdAt: string;
}

export interface DriverDocument {
  type: 'PERMIS' | 'CARTE_IDENTITE' | 'CARTE_GRISE' | 'ASSURANCE';
  url: string;
  status: 'PENDING' | 'VALIDATED' | 'REJECTED';
}

export interface Driver extends User {
  vehicleType: VehicleType;
  vehicleModel: string;
  plateNumber: string;
  isAvailable: boolean;
  rating: number;
  ridesCompleted: number;
  location: { lat: number; lng: number }; 
  documents: DriverDocument[];
  isVerified: boolean;
  subscriptionStatus: SubscriptionStatus;
  earningsToday: number; 
}

export interface Ride {
  id: string;
  clientId: string;
  driverId?: string;
  origin: string;
  destination: string;
  price: number; 
  distance: number;
  status: RideStatus;
  date: string;
  paymentMethod: PaymentMethod;
  vehicleType: VehicleType;
  category: RideCategory;
}
