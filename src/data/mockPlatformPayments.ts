import type { Transaction } from '@/types';

function hoursAgo(hours: number): string {
  const d = new Date();
  d.setHours(d.getHours() - hours);
  return d.toISOString();
}

/** Vue plateforme des transactions récentes — pour l'aperçu admin des paiements. */
export const MOCK_PLATFORM_PAYMENTS: Transaction[] = [
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
