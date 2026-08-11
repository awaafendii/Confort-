import type { Driver, RideCategory } from '@/types';
import { CONAKRY_MAP_CENTER } from './neighborhoods';

/**
 * Pool de chauffeurs de démonstration — utilisé par le matching (Phase 4)
 * pour simuler une attribution réaliste, y compris la couleur réelle du
 * véhicule (voir src/data/vehicleColors.ts) affichée sur la carte de
 * chauffeur trouvé.
 */
export const MOCK_DRIVERS_POOL: Driver[] = [
  {
    id: 'md-1',
    name: 'Mamadou Bah',
    phone: '622001122',
    role: 'DRIVER',
    avatar: 'https://i.pravatar.cc/150?u=d1',
    rating: 4.95,
    createdAt: new Date().toISOString(),
    vehicle: { id: 'v1', driverId: 'md-1', type: 'VOITURE', brand: 'Toyota', model: 'Corolla', plateNumber: 'RC-1234-A', color: 'blanc' },
    status: 'ONLINE',
    verification: 'VERIFIED',
    tripsCompleted: 450,
    acceptanceRate: 0.96,
    earningsToday: 150000,
    location: CONAKRY_MAP_CENTER,
    documents: [],
  },
  {
    id: 'md-2',
    name: 'Fatoumata Sylla',
    phone: '622334455',
    role: 'DRIVER',
    avatar: 'https://i.pravatar.cc/150?u=fatoumata',
    rating: 4.88,
    createdAt: new Date().toISOString(),
    vehicle: { id: 'v2', driverId: 'md-2', type: 'VOITURE', brand: 'Hyundai', model: 'Accent', plateNumber: 'RC-4471-C', color: 'bleu' },
    status: 'ONLINE',
    verification: 'VERIFIED',
    tripsCompleted: 312,
    acceptanceRate: 0.94,
    earningsToday: 98000,
    location: CONAKRY_MAP_CENTER,
    documents: [],
  },
  {
    id: 'md-3',
    name: 'Ousmane Diallo',
    phone: '655223344',
    role: 'DRIVER',
    avatar: 'https://i.pravatar.cc/150?u=ousmane',
    rating: 4.75,
    createdAt: new Date().toISOString(),
    vehicle: { id: 'v3', driverId: 'md-3', type: 'VOITURE', brand: 'Kia', model: 'Rio', plateNumber: 'RC-8820-B', color: 'noir' },
    status: 'ONLINE',
    verification: 'VERIFIED',
    tripsCompleted: 201,
    acceptanceRate: 0.9,
    earningsToday: 64000,
    location: CONAKRY_MAP_CENTER,
    documents: [],
  },
  {
    id: 'md-4',
    name: 'Ibrahima Soumah',
    phone: '664334455',
    role: 'DRIVER',
    avatar: 'https://i.pravatar.cc/150?u=d2',
    rating: 4.8,
    createdAt: new Date().toISOString(),
    vehicle: { id: 'v4', driverId: 'md-4', type: 'MOTO', brand: 'TVS', model: 'HLX 150', plateNumber: 'RC-9988-M', color: 'rouge' },
    status: 'ONLINE',
    verification: 'VERIFIED',
    tripsCompleted: 89,
    acceptanceRate: 0.92,
    earningsToday: 45000,
    location: CONAKRY_MAP_CENTER,
    documents: [],
  },
];

/** Attribue un chauffeur plausible pour la catégorie choisie + un ETA simulé (2-6 min). */
export function pickDriverFor(category: RideCategory): { driver: Driver; etaMin: number } {
  const vehicleType = category === 'MOTO_SINGLE' ? 'MOTO' : 'VOITURE';
  const candidates = MOCK_DRIVERS_POOL.filter((d) => d.vehicle.type === vehicleType);
  const pool = candidates.length > 0 ? candidates : MOCK_DRIVERS_POOL;
  const driver = pool[Math.floor(Math.random() * pool.length)];
  const etaMin = 2 + Math.floor(Math.random() * 5);
  return { driver, etaMin };
}
