import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MOCK_DRIVER_RIDES } from '@/data/mockDriverRides';
import type { Ride } from '@/types';

interface DriverRideHistoryState {
  rides: Ride[];
  addRide: (ride: Ride) => void;
}

/**
 * Historique des courses du chauffeur démo — miroir de `rideHistoryStore.ts` (passager).
 * Sans ce store, une course terminée via le flux Accueil → Suivi → Fin de course ne
 * réapparaissait jamais dans DriverTripsPage/DriverEarningsPage (trouvé pendant la QA 6.10 :
 * `onComplete` créditait bien les gains mais ne persistait la course nulle part).
 */
export const useDriverRideHistoryStore = create<DriverRideHistoryState>()(
  persist(
    (set) => ({
      rides: MOCK_DRIVER_RIDES,
      addRide: (ride) => set((state) => ({ rides: [ride, ...state.rides] })),
    }),
    { name: 'confort-plus-driver-ride-history' }
  )
);
