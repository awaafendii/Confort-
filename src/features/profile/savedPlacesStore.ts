import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SavedPlace } from '@/types';

interface SavedPlacesState {
  places: SavedPlace[];
  addPlace: (place: Omit<SavedPlace, 'id' | 'userId'>) => void;
  updatePlace: (id: string, patch: Partial<Omit<SavedPlace, 'id' | 'userId'>>) => void;
  removePlace: (id: string) => void;
}

const SEED_PLACES: SavedPlace[] = [
  {
    id: 'home',
    userId: 'demo',
    label: 'Home',
    address: 'Kaloum, Conakry',
    coords: { lat: 9.5092, lng: -13.7122 },
    icon: 'home',
  },
  {
    id: 'work',
    userId: 'demo',
    label: 'Work',
    address: 'Hamdallaye, Conakry',
    coords: { lat: 9.5571, lng: -13.6432 },
    icon: 'work',
  },
];

/** Lieux enregistrés — persistés en localStorage tant que Supabase n'est pas branché. */
export const useSavedPlacesStore = create<SavedPlacesState>()(
  persist(
    (set) => ({
      places: SEED_PLACES,
      addPlace: (place) =>
        set((state) => ({
          places: [...state.places, { ...place, id: `place-${Date.now()}`, userId: 'demo' }],
        })),
      updatePlace: (id, patch) =>
        set((state) => ({
          places: state.places.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        })),
      removePlace: (id) => set((state) => ({ places: state.places.filter((p) => p.id !== id) })),
    }),
    { name: 'confort-plus-saved-places' }
  )
);
