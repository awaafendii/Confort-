import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PaymentMethod, SavedPaymentMethod } from '@/types';

interface PaymentMethodsState {
  methods: SavedPaymentMethod[];
  addMethod: (input: { method: PaymentMethod; label: string; last4?: string }) => void;
  removeMethod: (id: string) => void;
  setDefault: (id: string) => void;
}

const ESPECE_METHOD: SavedPaymentMethod = {
  id: 'espece',
  userId: 'demo-passenger',
  method: 'ESPECE',
  label: 'Espèces',
  isDefault: true,
};

/**
 * Moyens de paiement enregistrés — préférences uniquement, aucune donnée
 * bancaire réelle ni traitement de paiement (voir walletStore.ts pour le
 * raisonnement complet : la consigne produit interdit toute fausse
 * transaction tant qu'une vraie intégration n'existe pas).
 */
export const usePaymentMethodsStore = create<PaymentMethodsState>()(
  persist(
    (set) => ({
      methods: [
        ESPECE_METHOD,
        { id: 'seed-om', userId: 'demo-passenger', method: 'ORANGE_MONEY', label: 'Orange Money · 620557799', isDefault: false },
      ],
      addMethod: (input) =>
        set((state) => ({
          methods: [...state.methods, { id: `pm-${Date.now()}`, userId: 'demo-passenger', isDefault: false, ...input }],
        })),
      removeMethod: (id) =>
        set((state) => (id === ESPECE_METHOD.id ? state : { methods: state.methods.filter((m) => m.id !== id) })),
      setDefault: (id) =>
        set((state) => ({ methods: state.methods.map((m) => ({ ...m, isDefault: m.id === id })) })),
    }),
    { name: 'confort-plus-payment-methods' }
  )
);
