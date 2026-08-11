import { create } from 'zustand';

interface DriverSessionState {
  tripsToday: number;
  incrementTripsToday: () => void;
}

/**
 * Compteur de courses du jour — volontairement non persisté (repart de
 * zéro à chaque nouvelle session, comme un vrai compteur journalier).
 * Séparé du store d'auth pour survivre à la navigation entre le dashboard
 * et l'écran de suivi (deux pages/montages différents) sans être un
 * simple state local perdu au démontage.
 */
export const useDriverSessionStore = create<DriverSessionState>((set) => ({
  tripsToday: 0,
  incrementTripsToday: () => set((s) => ({ tripsToday: s.tripsToday + 1 })),
}));
