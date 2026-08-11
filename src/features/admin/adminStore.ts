import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MOCK_PLATFORM_USERS } from '@/data/mockUsers';
import { MOCK_DRIVERS_POOL } from '@/data/mockDrivers';
import { MOCK_SUPPORT_TICKETS } from '@/data/mockSupportTickets';
import { MOCK_AUDIT_LOG } from '@/data/mockAuditLog';
import { useAuthStore } from '@/features/auth/store';
import type { AuditLog, Driver, DriverVerificationStatus, PlatformUser, SupportTicket } from '@/types';

/** Profil du chauffeur démo — dupliqué ici (plutôt qu'importé d'authService) pour ne pas coupler la couche données admin au mock d'authentification. */
const DEMO_DRIVER_ENTRY: Driver = {
  id: 'demo-driver',
  name: 'Mamadou Bah',
  phone: '622001122',
  email: 'mamadou@confortplus.gn',
  role: 'DRIVER',
  avatar: 'https://i.pravatar.cc/150?u=d1',
  rating: 4.95,
  createdAt: new Date().toISOString(),
  vehicle: { id: 'veh-1', driverId: 'demo-driver', type: 'VOITURE', brand: 'Toyota', model: 'Corolla', plateNumber: 'RC-1234-A', color: 'blanc' },
  status: 'ONLINE',
  verification: 'VERIFIED',
  tripsCompleted: 450,
  acceptanceRate: 0.96,
  earningsToday: 150000,
  location: { lat: 9.545, lng: -13.68 },
  documents: [],
};

interface AdminState {
  users: PlatformUser[];
  drivers: Driver[];
  tickets: SupportTicket[];
  auditLog: AuditLog[];
  setUserStatus: (id: string, status: PlatformUser['status']) => void;
  setDriverVerification: (id: string, verification: DriverVerificationStatus) => void;
  setTicketStatus: (id: string, status: SupportTicket['status']) => void;
}

const USER_STATUS_LABEL: Record<PlatformUser['status'], string> = {
  ACTIVE: 'Compte débloqué',
  BLOCKED: 'Compte bloqué',
  NEW: 'Compte marqué nouveau',
  SUSPENDED: 'Compte suspendu',
};

const VERIFICATION_LABEL: Record<DriverVerificationStatus, string> = {
  VERIFIED: 'Chauffeur vérifié',
  PENDING: 'Vérification chauffeur réinitialisée',
  SUSPENDED: 'Chauffeur suspendu',
};

const TICKET_STATUS_LABEL: Record<SupportTicket['status'], string> = {
  OPEN: 'Ticket rouvert',
  IN_PROGRESS: 'Ticket pris en charge',
  RESOLVED: 'Ticket résolu',
  CLOSED: 'Ticket fermé',
};

/** Ajoute une entrée d'audit en tête de liste, avec l'admin réellement connecté comme auteur (lu depuis authStore, pas passé en paramètre, pour que chaque action se log elle-même sans que chaque appelant y pense). */
function logAction(auditLog: AuditLog[], action: string, target: string): AuditLog[] {
  const actorId = useAuthStore.getState().account?.id ?? 'unknown';
  const entry: AuditLog = { id: `audit-${Date.now()}`, actorId, action, target, createdAt: new Date().toISOString() };
  return [entry, ...auditLog];
}

/** Modération admin — persistée pour que les actions (bloquer/vérifier/résoudre) survivent au rechargement. Chaque mutation s'enregistre aussi dans le journal d'audit (Phase 11, réservé aux SUPER_ADMIN). */
export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      users: MOCK_PLATFORM_USERS,
      // 'md-1' du pool est la même identité fictive que DEMO_DRIVER_ENTRY (même nom, même véhicule/plaque) : exclu pour éviter un doublon dans la liste admin.
      drivers: [DEMO_DRIVER_ENTRY, ...MOCK_DRIVERS_POOL.filter((d) => d.id !== 'md-1')],
      tickets: MOCK_SUPPORT_TICKETS,
      auditLog: MOCK_AUDIT_LOG,
      setUserStatus: (id, status) =>
        set((state) => {
          const target = state.users.find((u) => u.id === id);
          return {
            users: state.users.map((u) => (u.id === id ? { ...u, status } : u)),
            auditLog: target ? logAction(state.auditLog, USER_STATUS_LABEL[status], target.name) : state.auditLog,
          };
        }),
      setDriverVerification: (id, verification) =>
        set((state) => {
          const target = state.drivers.find((d) => d.id === id);
          return {
            drivers: state.drivers.map((d) => (d.id === id ? { ...d, verification } : d)),
            auditLog: target ? logAction(state.auditLog, VERIFICATION_LABEL[verification], target.name) : state.auditLog,
          };
        }),
      setTicketStatus: (id, status) =>
        set((state) => {
          const target = state.tickets.find((t) => t.id === id);
          return {
            tickets: state.tickets.map((t) => (t.id === id ? { ...t, status } : t)),
            auditLog: target ? logAction(state.auditLog, TICKET_STATUS_LABEL[status], target.subject) : state.auditLog,
          };
        }),
    }),
    { name: 'confort-plus-admin' }
  )
);
