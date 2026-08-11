import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ChatMessage } from '@/types';

interface ChatState {
  messagesByRide: Record<string, ChatMessage[]>;
  sendMessage: (rideId: string, message: Omit<ChatMessage, 'id' | 'createdAt'>) => void;
}

/**
 * Messagerie course — persistée par rideId. Aucun backend temps réel
 * n'existe encore (Supabase Realtime, Phase 11) : les réponses de l'autre
 * partie sont simulées côté page (voir ChatPage), pas ici.
 */
export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messagesByRide: {},
      sendMessage: (rideId, message) =>
        set((state) => ({
          messagesByRide: {
            ...state.messagesByRide,
            [rideId]: [
              ...(state.messagesByRide[rideId] ?? []),
              { ...message, id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, createdAt: new Date().toISOString() },
            ],
          },
        })),
    }),
    { name: 'confort-plus-chat' }
  )
);
