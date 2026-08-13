import type { User } from '@/types/user';
import type { Driver } from '@/types/driver';
import type { AuthAccount, PendingRegistration, PendingReset, RegisterInput } from './types';

/**
 * Service d'authentification — implémentation mock tant que Supabase Auth
 * n'est pas provisionné (voir src/services/supabaseClient.ts). L'interface
 * ci-dessous (login/register/verifyOtp/resetPassword) est celle qu'une
 * implémentation Supabase devra respecter en Phase 11 (Security + RLS) :
 * aucune page ne doit être réécrite, seul ce fichier changera.
 */

const OTP_TTL_MS = 5 * 60 * 1000;
const SIMULATED_LATENCY_MS = 700;

function delay(ms = SIMULATED_LATENCY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function normalizePhone(value: string): string {
  return value.replace(/\s+/g, '');
}

const DEMO_PASSENGER: User = {
  id: 'demo-passenger',
  name: 'Aïssatou Diallo',
  phone: '622000001',
  email: 'aissatou@confortplus.gn',
  role: 'PASSENGER',
  avatar: 'https://i.pravatar.cc/150?u=aissatou',
  rating: 4.9,
  createdAt: new Date().toISOString(),
};

const DEMO_DRIVER: Driver = {
  id: 'demo-driver',
  name: 'Mamadou Bah',
  phone: '622001122',
  email: 'mamadou@confortplus.gn',
  role: 'DRIVER',
  avatar: 'https://i.pravatar.cc/150?u=d1',
  rating: 4.95,
  createdAt: new Date().toISOString(),
  vehicle: {
    id: 'veh-1',
    driverId: 'demo-driver',
    type: 'VOITURE',
    brand: 'Toyota',
    model: 'Corolla',
    plateNumber: 'RC-1234-A',
    color: 'blanc',
  },
  status: 'ONLINE',
  verification: 'VERIFIED',
  tripsCompleted: 450,
  acceptanceRate: 0.96,
  earningsToday: 150000,
  location: { lat: 9.545, lng: -13.68 },
  documents: [
    {
      type: 'CARTE_IDENTITE',
      url: 'https://placehold.co/480x300/102A43/FFFFFF?text=Carte+d%27identit%C3%A9',
      status: 'VALIDATED',
    },
    {
      type: 'PERMIS',
      url: 'https://placehold.co/480x300/102A43/FFFFFF?text=Permis+de+conduire',
      status: 'REJECTED',
      rejectionReason: 'Photo floue — merci de renvoyer une photo nette et lisible du document.',
    },
  ],
};

const DEMO_ADMIN: User = {
  id: 'demo-admin',
  name: 'Admin Confort+',
  phone: '600000000',
  email: 'admin@confortplus.gn',
  role: 'ADMIN',
  avatar: 'https://i.pravatar.cc/150?u=admin',
  createdAt: new Date().toISOString(),
};

const DEMO_SUPER_ADMIN: User = {
  id: 'demo-super-admin',
  name: 'Founé Camara',
  phone: '600000009',
  email: 'founder@confortplus.gn',
  role: 'SUPER_ADMIN',
  avatar: 'https://i.pravatar.cc/150?u=superadmin',
  createdAt: new Date().toISOString(),
};

export const DEMO_ACCOUNTS: { label: string; account: AuthAccount }[] = [
  { label: 'Passager', account: DEMO_PASSENGER },
  { label: 'Pilote', account: DEMO_DRIVER },
  { label: 'Admin', account: DEMO_ADMIN },
  { label: 'Super Admin', account: DEMO_SUPER_ADMIN },
];

const accountsByPhone = new Map<string, AuthAccount>(
  DEMO_ACCOUNTS.map(({ account }) => [normalizePhone(account.phone), account])
);

// État en mémoire du flux d'inscription / réinitialisation (mock uniquement).
let pendingRegistration: PendingRegistration | null = null;
let pendingReset: PendingReset | null = null;

export class AuthError extends Error {}

export async function login(identifier: string, password: string): Promise<AuthAccount> {
  await delay();
  if (!identifier.trim()) throw new AuthError('Entrez votre numéro de téléphone ou email.');
  if (password.length < 4) throw new AuthError('Mot de passe trop court (4 caractères minimum).');

  const phone = normalizePhone(identifier);
  const known = accountsByPhone.get(phone) ?? DEMO_ACCOUNTS.find((d) => d.account.email === identifier)?.account;
  if (known) return known;

  // Aucun compte connu : on crée une session passager ad hoc (mode démo).
  const adHoc: User = {
    id: `u-${phone}`,
    name: `Passager ${phone}`,
    phone,
    role: 'PASSENGER',
    createdAt: new Date().toISOString(),
  };
  accountsByPhone.set(phone, adHoc);
  return adHoc;
}

/** Démarre une inscription : génère un OTP (retourné pour l'affichage démo, aucun SMS réel envoyé). */
export async function startRegistration(input: RegisterInput): Promise<{ otp: string }> {
  await delay();
  if (!input.name || !input.phone || !input.email || !input.password) {
    throw new AuthError('Nom, téléphone, email et mot de passe sont requis.');
  }
  if (input.password.length < 6) throw new AuthError('Le mot de passe doit contenir au moins 6 caractères.');
  if (input.role === 'DRIVER' && !input.vehicle) {
    throw new AuthError('Renseignez les informations du véhicule.');
  }

  const otp = generateOtp();
  pendingRegistration = { otp, input, expiresAt: Date.now() + OTP_TTL_MS };
  return { otp };
}

export async function resendRegistrationOtp(): Promise<{ otp: string }> {
  await delay(400);
  if (!pendingRegistration) throw new AuthError('Aucune inscription en cours.');
  const otp = generateOtp();
  pendingRegistration = { ...pendingRegistration, otp, expiresAt: Date.now() + OTP_TTL_MS };
  return { otp };
}

export async function verifyRegistrationOtp(code: string): Promise<AuthAccount> {
  await delay();
  if (!pendingRegistration) throw new AuthError('Aucune inscription en cours.');
  if (Date.now() > pendingRegistration.expiresAt) throw new AuthError('Code expiré, demandez un renvoi.');
  if (code !== pendingRegistration.otp) throw new AuthError('Code de vérification incorrect.');

  const { input } = pendingRegistration;
  const phone = normalizePhone(input.phone);
  const base = {
    id: `u-${Date.now()}`,
    name: input.name,
    phone,
    email: input.email,
    avatar: input.avatar,
    createdAt: new Date().toISOString(),
  };

  const account: AuthAccount =
    input.role === 'PASSENGER'
      ? { ...base, role: 'PASSENGER' }
      : {
          ...base,
          role: 'DRIVER',
          rating: 5,
          tripsCompleted: 0,
          acceptanceRate: 1,
          earningsToday: 0,
          status: 'OFFLINE',
          verification: 'PENDING',
          location: { lat: 9.5092, lng: -13.7122 },
          documents: [],
          vehicle: { id: `veh-${Date.now()}`, driverId: base.id, ...input.vehicle! },
        };

  accountsByPhone.set(phone, account);
  pendingRegistration = null;
  return account;
}

export async function requestPasswordReset(identifier: string): Promise<{ otp: string }> {
  await delay();
  if (!identifier.trim()) throw new AuthError('Entrez votre numéro de téléphone ou email.');
  const otp = generateOtp();
  pendingReset = { otp, identifier, expiresAt: Date.now() + OTP_TTL_MS };
  return { otp };
}

export async function confirmPasswordReset(code: string, _newPassword: string): Promise<void> {
  await delay();
  if (!pendingReset) throw new AuthError('Aucune demande de réinitialisation en cours.');
  if (Date.now() > pendingReset.expiresAt) throw new AuthError('Code expiré, demandez un renvoi.');
  if (code !== pendingReset.otp) throw new AuthError('Code de vérification incorrect.');
  pendingReset = null;
}
