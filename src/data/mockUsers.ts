import type { PlatformUser } from '@/types';

function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

/** Utilisateurs de démonstration pour l'espace admin — la passagère démo est incluse pour la continuité. */
export const MOCK_PLATFORM_USERS: PlatformUser[] = [
  {
    id: 'demo-passenger',
    name: 'Aïssatou Diallo',
    phone: '622000001',
    email: 'aissatou@confortplus.gn',
    role: 'PASSENGER',
    avatar: 'https://i.pravatar.cc/150?u=aissatou',
    rating: 4.9,
    createdAt: daysAgo(120),
    status: 'ACTIVE',
    tripsCount: 8,
  },
  { id: 'u-2', name: 'Mariama Barry', phone: '625114477', email: 'mariama.barry@example.gn', role: 'PASSENGER', avatar: 'https://i.pravatar.cc/150?u=mariama', rating: 4.7, createdAt: daysAgo(95), status: 'ACTIVE', tripsCount: 21 },
  { id: 'u-3', name: 'Alpha Condé', phone: '628993311', email: 'alpha.conde@example.gn', role: 'PASSENGER', avatar: 'https://i.pravatar.cc/150?u=alpha', rating: 4.9, createdAt: daysAgo(80), status: 'ACTIVE', tripsCount: 14 },
  { id: 'u-4', name: 'Kadiatou Bah', phone: '621556688', email: 'kadiatou.bah@example.gn', role: 'PASSENGER', avatar: 'https://i.pravatar.cc/150?u=kadiatou', rating: 4.6, createdAt: daysAgo(60), status: 'NEW', tripsCount: 2 },
  { id: 'u-5', name: 'Sékou Kourouma', phone: '629887744', email: 'sekou.kourouma@example.gn', role: 'PASSENGER', avatar: 'https://i.pravatar.cc/150?u=sekou', rating: 4.4, createdAt: daysAgo(45), status: 'ACTIVE', tripsCount: 6 },
  { id: 'u-6', name: 'Fatoumata Sylla', phone: '620774411', email: 'fatoumata.sylla@example.gn', role: 'PASSENGER', avatar: 'https://i.pravatar.cc/150?u=fatoumata', rating: 3.9, createdAt: daysAgo(30), status: 'SUSPENDED', tripsCount: 4 },
  { id: 'u-7', name: 'Ousmane Diallo', phone: '655223344', email: 'ousmane.diallo@example.gn', role: 'PASSENGER', avatar: 'https://i.pravatar.cc/150?u=ousmane2', rating: 4.2, createdAt: daysAgo(20), status: 'ACTIVE', tripsCount: 3 },
  { id: 'u-8', name: 'Binta Camara', phone: '622447788', email: 'binta.camara@example.gn', role: 'PASSENGER', avatar: 'https://i.pravatar.cc/150?u=binta', rating: 3.5, createdAt: daysAgo(10), status: 'BLOCKED', tripsCount: 1 },
  { id: 'u-9', name: 'Ibrahima Sow', phone: '664998877', email: 'ibrahima.sow@example.gn', role: 'PASSENGER', avatar: 'https://i.pravatar.cc/150?u=ibrahimasow', rating: 4.8, createdAt: daysAgo(3), status: 'NEW', tripsCount: 1 },
  { id: 'u-10', name: 'Mamadouba Keita', phone: '628112233', email: 'mamadouba.keita@example.gn', role: 'PASSENGER', avatar: 'https://i.pravatar.cc/150?u=mamadouba', rating: 4.5, createdAt: daysAgo(1), status: 'NEW', tripsCount: 0 },
];
