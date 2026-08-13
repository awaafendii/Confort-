import type { User } from './user';

/** Vue admin d'un utilisateur — le compte de base (User) enrichi des champs de gestion plateforme. */
export interface PlatformUser extends User {
  status: 'ACTIVE' | 'BLOCKED' | 'NEW' | 'SUSPENDED';
  tripsCount: number;
}

export type TicketStatus = 'NEW' | 'IN_PROGRESS' | 'WAITING' | 'RESOLVED' | 'CLOSED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type TicketCategory = 'PAIEMENT' | 'COURSE' | 'COMPTE' | 'AUTRE';

export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  /** Course liée, quand le ticket porte sur une course précise. */
  rideId?: string;
  /** Id de l'admin en charge — absent tant que personne ne s'est assigné le ticket. */
  assignedTo?: string;
  createdAt: string;
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  authorId: string;
  authorRole: 'USER' | 'ADMIN';
  body: string;
  createdAt: string;
}

export type AuditModule = 'Utilisateurs' | 'Chauffeurs' | 'Courses' | 'Paiements' | 'Support';

export interface AuditLog {
  id: string;
  actorId: string;
  action: string;
  target: string;
  module: AuditModule;
  /** Toujours 'SUCCESS' ici — aucun chemin d'échec n'existe encore pour une action admin dans cette démo (pas de backend à interroger). */
  result: 'SUCCESS';
  /** Identifiant de session navigateur réel (généré côté client), pas une IP — aucun serveur ne capture d'IP dans cette démo statique. */
  sessionId: string;
  createdAt: string;
}

export interface PlatformKpis {
  totalUsers: number;
  activePassengers: number;
  activeDrivers: number;
  tripsToday: number;
  revenueToday: number;
  cancellationRate: number;
  averageRating: number;
}
