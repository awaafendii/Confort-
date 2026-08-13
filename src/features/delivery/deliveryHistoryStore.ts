import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SEED_DELIVERY_HISTORY } from '@/data/mockDeliveries';
import type { Delivery } from '@/types';

interface DeliveryHistoryState {
  deliveries: Delivery[];
  addDelivery: (delivery: Delivery) => void;
}

/** Historique des livraisons du passager démo — même principe que rideHistoryStore.ts. */
export const useDeliveryHistoryStore = create<DeliveryHistoryState>()(
  persist(
    (set) => ({
      deliveries: SEED_DELIVERY_HISTORY,
      addDelivery: (delivery) => set((state) => ({ deliveries: [delivery, ...state.deliveries] })),
    }),
    { name: 'confort-plus-delivery-history' }
  )
);
