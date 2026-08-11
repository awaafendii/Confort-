import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthAccount } from './types';

interface AuthState {
  account: AuthAccount | null;
  hasSeenOnboarding: boolean;
  setAccount: (account: AuthAccount) => void;
  updateAccount: (patch: Partial<AuthAccount>) => void;
  completeOnboarding: () => void;
  logout: () => void;
}

/**
 * Session Confort+ — persistée en localStorage pour que la démo survive un
 * rafraîchissement de page. Sera remplacée par la session Supabase Auth
 * réelle en Phase 11, sans changer la forme de ce store (mêmes actions).
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      account: null,
      hasSeenOnboarding: false,
      setAccount: (account) => set({ account }),
      updateAccount: (patch) =>
        set((state) => (state.account ? { account: { ...state.account, ...patch } as AuthAccount } : state)),
      completeOnboarding: () => set({ hasSeenOnboarding: true }),
      logout: () => set({ account: null }),
    }),
    { name: 'confort-plus-auth' }
  )
);
