import type { Transaction } from '@/types';
import { MOCK_PLATFORM_RIDES } from './mockPlatformRides';

function hoursAgo(hours: number): string {
  const d = new Date();
  d.setHours(d.getHours() - hours);
  return d.toISOString();
}

/** Vue plateforme des transactions récentes du jour — pour l'aperçu admin des paiements. */
const TODAY_PAYMENTS: Transaction[] = [
  { id: 'ptxn-1', userId: 'demo-passenger', rideId: 'pride-1', amount: 3000, currency: 'GNF', type: 'DEBIT', method: 'ORANGE_MONEY', description: 'Course Kaloum → Madina', date: hoursAgo(1), status: 'SUCCESS' },
  { id: 'ptxn-2', userId: 'u-2', rideId: 'pride-2', amount: 2500, currency: 'GNF', type: 'DEBIT', method: 'MOMO', description: 'Course Dixinn → Hamdallaye', date: hoursAgo(3), status: 'SUCCESS' },
  { id: 'ptxn-3', userId: 'u-3', rideId: 'pride-3', amount: 20000, currency: 'GNF', type: 'DEBIT', method: 'ESPECE', description: 'Course Hamdallaye → Cité-Rail', date: hoursAgo(4), status: 'SUCCESS' },
  { id: 'ptxn-4', userId: 'u-5', amount: 15000, currency: 'GNF', type: 'CREDIT', method: 'ORANGE_MONEY', description: 'Rechargement portefeuille', date: hoursAgo(5), status: 'SUCCESS' },
  { id: 'ptxn-5', userId: 'u-5', rideId: 'pride-5', amount: 3000, currency: 'GNF', type: 'DEBIT', method: 'ESPECE', description: 'Course Aéroport → Sangoyah', date: hoursAgo(6), status: 'SUCCESS' },
  { id: 'ptxn-6', userId: 'u-6', rideId: 'pride-6', amount: 4000, currency: 'GNF', type: 'DEBIT', method: 'MOMO', description: 'Course T6 → T8', date: hoursAgo(8), status: 'FAILED' },
  { id: 'ptxn-7', userId: 'u-7', rideId: 'pride-7', amount: 1500, currency: 'GNF', type: 'DEBIT', method: 'ORANGE_MONEY', description: 'Course Madina → Aéroport', date: hoursAgo(10), status: 'SUCCESS' },
  { id: 'ptxn-8', userId: 'u-8', rideId: 'pride-8', amount: 20000, currency: 'GNF', type: 'DEBIT', method: 'ESPECE', description: 'Course Cité-Rail → T6', date: hoursAgo(14), status: 'SUCCESS' },
  { id: 'ptxn-9', userId: 'u-10', amount: 10000, currency: 'GNF', type: 'CREDIT', method: 'MOMO', description: 'Rechargement portefeuille', date: hoursAgo(24), status: 'PENDING' },
];

/**
 * Transactions historiques dérivées des courses de la plateforme (§7.1) plutôt qu'inventées
 * séparément — une transaction ne peut honnêtement exister que si une course réelle la
 * justifie. Espèces exclues (aucun paiement électronique à tracer). Une petite partie des
 * courses non-espèces échoue (déterministe) pour que "Paiements échoués" ait un sens sur
 * une fenêtre 7/30 jours, comme dans les données du jour.
 */
function buildHistoricalPayments(): Transaction[] {
  return MOCK_PLATFORM_RIDES.filter((r) => r.id.startsWith('pride-h') && r.status === 'COMPLETED' && r.paymentMethod !== 'ESPECE').map((r, i) => ({
    id: `ptxn-h${r.id}`,
    userId: r.passengerId,
    rideId: r.id,
    amount: r.fare,
    currency: 'GNF',
    type: 'DEBIT',
    method: r.paymentMethod,
    description: `Course ${r.pickup.label} → ${r.destination.label}`,
    date: r.completedAt ?? r.requestedAt,
    status: i % 11 === 0 ? 'FAILED' : 'SUCCESS',
  }));
}

export const MOCK_PLATFORM_PAYMENTS: Transaction[] = [...TODAY_PAYMENTS, ...buildHistoricalPayments()];
