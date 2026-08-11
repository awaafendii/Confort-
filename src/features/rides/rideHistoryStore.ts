import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SEED_RIDE_HISTORY } from '@/data/mockRides';
import type { Ride } from '@/types';

interface RideHistoryState {
  rides: Ride[];
  addRide: (ride: Ride) => void;
}

/** Historique des courses du passager démo — persisté pour que les courses simulées (Phase 6) restent visibles après un rechargement. */
export const useRideHistoryStore = create<RideHistoryState>()(
  persist(
    (set) => ({
      rides: SEED_RIDE_HISTORY,
      addRide: (ride) => set((state) => ({ rides: [ride, ...state.rides] })),
    }),
    { name: 'confort-plus-ride-history' }
  )
);
