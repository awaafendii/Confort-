import type { TicketMessage } from '@/types';
import { MOCK_SUPPORT_TICKETS } from './mockSupportTickets';

const OPENING_MESSAGE: Record<string, string> = {
  'tk-1': "Bonjour, j'ai été débité deux fois pour la même course Kaloum → Madina. Pouvez-vous vérifier et me rembourser le doublon ?",
  'tk-2': "Ma carte grise a été rejetée mais le document est parfaitement lisible. Pouvez-vous la réexaminer ?",
  'tk-3': "Mon compte a été bloqué sans que je reçoive d'explication. Pourquoi, et comment puis-je le débloquer ?",
  'tk-4': "Le chauffeur a été très impoli pendant tout le trajet. Je voulais le signaler.",
  'tk-5': "Comment recharger mon portefeuille avec Orange Money ? Je ne trouve pas l'option.",
  'tk-6': "Ma course a été annulée mais le montant n'a pas été remboursé sur mon compte. Merci de vérifier.",
};

/** Message d'ouverture de chaque ticket — reprend la demande initiale de l'utilisateur, pas une conversation fabriquée au-delà de ce point (les réponses admin sont ajoutées en tête via adminStore.ts). */
export const MOCK_TICKET_MESSAGES: TicketMessage[] = MOCK_SUPPORT_TICKETS.map((ticket) => ({
  id: `msg-${ticket.id}-1`,
  ticketId: ticket.id,
  authorId: ticket.userId,
  authorRole: 'USER',
  body: OPENING_MESSAGE[ticket.id] ?? ticket.subject,
  createdAt: ticket.createdAt,
}));
