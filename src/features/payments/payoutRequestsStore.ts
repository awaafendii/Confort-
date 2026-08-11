import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PaymentMethod } from '@/types';

export interface PayoutRequest {
  id: string;
  amount: number;
  method: PaymentMethod;
  destinationLabel: string;
  status: 'PENDING';
  createdAt: string;
}

interface PayoutRequestsState {
  requests: PayoutRequest[];
  addRequest: (input: Omit<PayoutRequest, 'id' | 'status' | 'createdAt'>) => void;
}

/**
 * Demandes de retrait chauffeur — enregistre une demande en attente, ne
 * simule jamais un virement effectif (aucune intégration Mobile Money
 * réelle n'existe encore). Les gains du chauffeur ne sont pas débités ici.
 */
export const usePayoutRequestsStore = create<PayoutRequestsState>()(
  persist(
    (set) => ({
      requests: [],
      addRequest: (input) =>
        set((state) => ({
          requests: [{ ...input, id: `payout-${Date.now()}`, status: 'PENDING', createdAt: new Date().toISOString() }, ...state.requests],
        })),
    }),
    { name: 'confort-plus-payout-requests' }
  )
);
