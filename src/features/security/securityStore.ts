import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface DeviceSession {
  id: string;
  device: string;
  location: string;
  lastActive: string;
}

function hoursAgo(hours: number): string {
  const d = new Date();
  d.setHours(d.getHours() - hours);
  return d.toISOString();
}

/** Sessions de démonstration attribuées à tout compte n'ayant pas encore de liste enregistrée. */
export const DEFAULT_SESSIONS: DeviceSession[] = [
  { id: 'sess-mobile', device: 'Application Confort+ — iPhone 13', location: 'Kaloum, Conakry', lastActive: hoursAgo(2) },
  { id: 'sess-desktop', device: 'Chrome — Windows', location: 'Dixinn, Conakry', lastActive: hoursAgo(26) },
];

interface SecurityState {
  twoFactor: Record<string, boolean>;
  sessions: Record<string, DeviceSession[]>;
  deletionRequestedAt: Record<string, string | undefined>;
  toggleTwoFactor: (accountId: string) => void;
  revokeSession: (accountId: string, sessionId: string) => void;
  requestDeletion: (accountId: string) => void;
}

/** Préférences de sécurité par compte — persistées comme les autres stores démo, aucune n'est reliée à un vrai backend d'auth tant que Supabase n'est pas branché (voir authService.ts). */
export const useSecurityStore = create<SecurityState>()(
  persist(
    (set) => ({
      twoFactor: {},
      sessions: {},
      deletionRequestedAt: {},
      toggleTwoFactor: (accountId) =>
        set((state) => ({ twoFactor: { ...state.twoFactor, [accountId]: !state.twoFactor[accountId] } })),
      revokeSession: (accountId, sessionId) =>
        set((state) => ({
          sessions: {
            ...state.sessions,
            [accountId]: (state.sessions[accountId] ?? DEFAULT_SESSIONS).filter((s) => s.id !== sessionId),
          },
        })),
      requestDeletion: (accountId) =>
        set((state) => ({ deletionRequestedAt: { ...state.deletionRequestedAt, [accountId]: new Date().toISOString() } })),
    }),
    { name: 'confort-plus-security' }
  )
);
