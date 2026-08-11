import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SEED_NOTIFICATIONS } from '@/data/mockNotifications';
import type { AppNotification } from '@/types';

interface NotificationsState {
  notifications: AppNotification[];
  markAsRead: (id: string) => void;
  markAllAsRead: (userId: string) => void;
  addNotification: (input: Omit<AppNotification, 'id' | 'read' | 'createdAt'>) => void;
}

/** Notifications — persistées pour que les nouvelles alertes (ex. fin de course) survivent au rechargement. */
export const useNotificationsStore = create<NotificationsState>()(
  persist(
    (set) => ({
      notifications: SEED_NOTIFICATIONS,
      markAsRead: (id) =>
        set((state) => ({ notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) })),
      markAllAsRead: (userId) =>
        set((state) => ({
          notifications: state.notifications.map((n) => (n.userId === userId ? { ...n, read: true } : n)),
        })),
      addNotification: (input) =>
        set((state) => ({
          notifications: [
            { ...input, id: `notif-${Date.now()}`, read: false, createdAt: new Date().toISOString() },
            ...state.notifications,
          ],
        })),
    }),
    { name: 'confort-plus-notifications' }
  )
);
