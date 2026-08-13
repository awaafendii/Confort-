import type { SupportTicket } from '@/types';

function hoursAgo(hours: number): string {
  const d = new Date();
  d.setHours(d.getHours() - hours);
  return d.toISOString();
}

/** Tickets de support de démonstration. */
export const MOCK_SUPPORT_TICKETS: SupportTicket[] = [
  { id: 'tk-1', userId: 'u-6', subject: 'Course facturée deux fois', status: 'NEW', priority: 'HIGH', category: 'PAIEMENT', createdAt: hoursAgo(2) },
  {
    id: 'tk-2',
    userId: 'demo-driver',
    subject: 'Document carte grise rejeté à tort',
    status: 'IN_PROGRESS',
    priority: 'MEDIUM',
    category: 'COMPTE',
    assignedTo: 'demo-admin',
    createdAt: hoursAgo(9),
  },
  { id: 'tk-3', userId: 'u-8', subject: 'Compte bloqué sans explication', status: 'NEW', priority: 'HIGH', category: 'COMPTE', createdAt: hoursAgo(15) },
  {
    id: 'tk-4',
    userId: 'u-3',
    subject: 'Chauffeur impoli pendant la course',
    status: 'RESOLVED',
    priority: 'MEDIUM',
    category: 'COURSE',
    rideId: 'pride-3',
    assignedTo: 'demo-admin',
    createdAt: hoursAgo(40),
  },
  {
    id: 'tk-5',
    userId: 'u-2',
    subject: 'Question sur le rechargement du portefeuille',
    status: 'CLOSED',
    priority: 'LOW',
    category: 'PAIEMENT',
    assignedTo: 'demo-admin',
    createdAt: hoursAgo(72),
  },
  {
    id: 'tk-6',
    userId: 'u-9',
    subject: 'Demande de remboursement',
    status: 'WAITING',
    priority: 'MEDIUM',
    category: 'PAIEMENT',
    assignedTo: 'demo-admin',
    createdAt: hoursAgo(1),
  },
];
