import type { StatusConfig } from '@/components/ui';
import type { TicketCategory, TicketPriority, TicketStatus } from '@/types';

export const TICKET_STATUS_CONFIG: Record<TicketStatus, StatusConfig> = {
  NEW: { label: 'Nouveau', variant: 'accent' },
  IN_PROGRESS: { label: 'En cours', variant: 'neutral' },
  WAITING: { label: 'En attente', variant: 'warning' },
  RESOLVED: { label: 'Résolu', variant: 'success' },
  CLOSED: { label: 'Fermé', variant: 'danger' },
};

export const TICKET_PRIORITY_CONFIG: Record<TicketPriority, StatusConfig> = {
  HIGH: { label: 'Priorité haute', variant: 'danger' },
  MEDIUM: { label: 'Priorité moyenne', variant: 'warning' },
  LOW: { label: 'Priorité basse', variant: 'neutral' },
};

export const TICKET_CATEGORY_LABEL: Record<TicketCategory, string> = {
  PAIEMENT: 'Paiement',
  COURSE: 'Course',
  COMPTE: 'Compte',
  AUTRE: 'Autre',
};
