import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Transaction } from '@/types';

interface WalletState {
  balance: number;
  transactions: Transaction[];
}

function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

const SEED_TRANSACTIONS: Transaction[] = [
  {
    id: 'txn-1',
    userId: 'demo-passenger',
    amount: 25000,
    currency: 'GNF',
    type: 'CREDIT',
    method: 'ORANGE_MONEY',
    description: 'Rechargement Orange Money',
    date: daysAgo(5),
    status: 'SUCCESS',
  },
  {
    id: 'txn-2',
    userId: 'demo-passenger',
    rideId: 'ride-2',
    amount: 8000,
    currency: 'GNF',
    type: 'DEBIT',
    method: 'MOMO',
    description: 'Course Kaloum → Dixinn',
    date: daysAgo(4),
    status: 'SUCCESS',
  },
  {
    id: 'txn-3',
    userId: 'demo-passenger',
    rideId: 'ride-1',
    amount: 2000,
    currency: 'GNF',
    type: 'DEBIT',
    method: 'ORANGE_MONEY',
    description: 'Course Kaloum → Madina',
    date: daysAgo(1),
    status: 'SUCCESS',
  },
];

/**
 * Portefeuille de démonstration — solde et historique mockés (autorisé
 * par la consigne produit tant qu'aucune intégration réelle n'existe).
 * IMPORTANT : aucune action de l'app ne doit créditer ce solde en dehors
 * de ce seed — un vrai rechargement nécessite Orange Money/MoMo/Stripe,
 * pas encore branché. Ne jamais simuler une transaction qui se termine
 * avec succès sans intégration réelle derrière (« ne pas implémenter de
 * fausses transactions »).
 */
export const useWalletStore = create<WalletState>()(
  persist(
    () => ({
      balance: 15000,
      transactions: SEED_TRANSACTIONS,
    }),
    { name: 'confort-plus-wallet' }
  )
);
