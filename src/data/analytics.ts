import { MOCK_PLATFORM_USERS } from './mockUsers';
import { MOCK_PLATFORM_RIDES } from './mockPlatformRides';
import { MOCK_PLATFORM_PAYMENTS } from './mockPlatformPayments';
import { RIDE_CATEGORIES_CONFIG } from './pricing';
import type { PaymentMethod, RideCategory } from '@/types';

/** Nombre de courses par catégorie — ordre fixe de RIDE_CATEGORIES_CONFIG (jamais recalculé dynamiquement, pour un ordre catégoriel stable). */
export function computeRidesByCategory(): { category: RideCategory; label: string; count: number }[] {
  return (Object.keys(RIDE_CATEGORIES_CONFIG) as RideCategory[]).map((category) => ({
    category,
    label: RIDE_CATEGORIES_CONFIG[category].label,
    count: MOCK_PLATFORM_RIDES.filter((r) => r.category === category).length,
  }));
}

const PAYMENT_METHOD_ORDER: PaymentMethod[] = ['ESPECE', 'ORANGE_MONEY', 'MOMO', 'PAYCARD', 'VISA', 'KULU'];
const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  ESPECE: 'Espèces',
  ORANGE_MONEY: 'Orange Money',
  MOMO: 'MoMo',
  PAYCARD: 'PayCard',
  VISA: 'Carte',
  KULU: 'Kulu',
};

/** Volume réussi par méthode de paiement — seules les transactions SUCCESS comptent, méthodes absentes des données omises. */
export function computePaymentsByMethod(): { method: PaymentMethod; label: string; amount: number }[] {
  return PAYMENT_METHOD_ORDER.map((method) => ({
    method,
    label: PAYMENT_METHOD_LABEL[method],
    amount: MOCK_PLATFORM_PAYMENTS.filter((t) => t.method === method && t.status === 'SUCCESS').reduce((sum, t) => sum + t.amount, 0),
  })).filter((row) => row.amount > 0);
}

const AGE_BUCKETS = [
  { label: '+90j', min: 90, max: Infinity },
  { label: '61-90j', min: 61, max: 90 },
  { label: '31-60j', min: 31, max: 60 },
  { label: '15-30j', min: 15, max: 30 },
  { label: '0-14j', min: 0, max: 14 },
];

function daysSince(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}

/** Nouveaux utilisateurs par ancienneté de compte, du plus ancien au plus récent — une tendance de croissance dérivée des vraies dates d'inscription plutôt qu'une série inventée à part. */
export function computeUserGrowth(): { label: string; count: number }[] {
  return AGE_BUCKETS.map((bucket) => ({
    label: bucket.label,
    count: MOCK_PLATFORM_USERS.filter((u) => {
      const age = daysSince(u.createdAt);
      return age >= bucket.min && age <= bucket.max;
    }).length,
  }));
}
