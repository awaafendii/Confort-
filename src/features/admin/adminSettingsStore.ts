import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PaymentMethod } from '@/types';

export interface AdminSettingsState {
  general: { supportEmail: string; supportPhone: string };
  featureFlags: { signupsEnabled: boolean; motoEnabled: boolean };
  maintenance: { enabled: boolean; message: string };
  paymentMethods: Record<PaymentMethod, boolean>;
  notifications: { emailAlerts: boolean; pushAlerts: boolean };
  security: { twoFactorRequired: boolean; sessionTimeout: boolean };
  setGeneral: (patch: Partial<AdminSettingsState['general']>) => void;
  setFeatureFlag: (key: keyof AdminSettingsState['featureFlags']) => void;
  setMaintenanceEnabled: () => void;
  setMaintenanceMessage: (message: string) => void;
  setPaymentMethodEnabled: (method: PaymentMethod) => void;
  setNotification: (key: keyof AdminSettingsState['notifications']) => void;
  setSecurity: (key: keyof AdminSettingsState['security']) => void;
}

/**
 * Paramètres admin — persistés (audit § Paramètres : les toggles en `useState` local, dont
 * "Mode maintenance", se réinitialisaient au rechargement, un piège réel sur un écran de
 * configuration critique). Tous les toggles ici affectent uniquement l'affichage admin — aucun
 * n'est branché à un vrai comportement runtime de l'app (pas de backend), exactement comme la
 * grille tarifaire déjà "réservée à l'équipe produit" plus bas sur cet écran.
 */
export const useAdminSettingsStore = create<AdminSettingsState>()(
  persist(
    (set) => ({
      general: { supportEmail: 'support@confortplus.gn', supportPhone: '622000000' },
      featureFlags: { signupsEnabled: true, motoEnabled: true },
      maintenance: { enabled: false, message: 'Confort+ est actuellement en maintenance. Merci de réessayer dans quelques minutes.' },
      paymentMethods: { ESPECE: true, ORANGE_MONEY: true, MOMO: true, PAYCARD: false, VISA: false, KULU: false },
      notifications: { emailAlerts: true, pushAlerts: false },
      security: { twoFactorRequired: false, sessionTimeout: true },
      setGeneral: (patch) => set((state) => ({ general: { ...state.general, ...patch } })),
      setFeatureFlag: (key) => set((state) => ({ featureFlags: { ...state.featureFlags, [key]: !state.featureFlags[key] } })),
      setMaintenanceEnabled: () => set((state) => ({ maintenance: { ...state.maintenance, enabled: !state.maintenance.enabled } })),
      setMaintenanceMessage: (message) => set((state) => ({ maintenance: { ...state.maintenance, message } })),
      setPaymentMethodEnabled: (method) =>
        set((state) => ({ paymentMethods: { ...state.paymentMethods, [method]: !state.paymentMethods[method] } })),
      setNotification: (key) => set((state) => ({ notifications: { ...state.notifications, [key]: !state.notifications[key] } })),
      setSecurity: (key) => set((state) => ({ security: { ...state.security, [key]: !state.security[key] } })),
    }),
    { name: 'confort-plus-admin-settings' }
  )
);
