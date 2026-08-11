import type { User } from './user';

/** Vue admin d'un utilisateur — le compte de base (User) enrichi des champs de gestion plateforme. */
export interface PlatformUser extends User {
  status: 'ACTIVE' | 'BLOCKED' | 'NEW' | 'SUSPENDED';
  tripsCount: number;
}

export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  action: string;
  target: string;
  createdAt: string;
}

export interface PlatformKpis {
  totalUsers: number;
  activeDrivers: number;
  tripsToday: number;
  revenueToday: number;
  cancellationRate: number;
  averageRating: number;
}
