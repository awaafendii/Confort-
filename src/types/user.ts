export type UserRole = 'PASSENGER' | 'DRIVER' | 'ADMIN' | 'SUPER_ADMIN';

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  avatar?: string;
  rating?: number;
  createdAt: string;
}

export interface SavedPlace {
  id: string;
  userId: string;
  label: 'Home' | 'Work' | string;
  address: string;
  coords: { lat: number; lng: number };
  icon?: 'home' | 'work' | 'star';
}
