import { MOCK_PLATFORM_USERS } from './mockUsers';
import { MOCK_PLATFORM_RIDES } from './mockPlatformRides';
import { MOCK_PLATFORM_PAYMENTS } from './mockPlatformPayments';
import { RIDE_CATEGORIES_CONFIG } from './pricing';
import type { PaymentMethod, Ride, RideCategory } from '@/types';

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function periodRides(days: number): Ride[] {
  const cutoff = startOfDay(new Date());
  cutoff.setDate(cutoff.getDate() - days + 1);
  return MOCK_PLATFORM_RIDES.filter((r) => new Date(r.requestedAt) >= cutoff);
}

/** Nombre de courses par catégorie sur la période — ordre fixe de RIDE_CATEGORIES_CONFIG (jamais recalculé dynamiquement, pour un ordre catégoriel stable). */
export function computeRidesByCategory(days: number): { category: RideCategory; label: string; count: number }[] {
  const rides = periodRides(days);
  return (Object.keys(RIDE_CATEGORIES_CONFIG) as RideCategory[]).map((category) => ({
    category,
    label: RIDE_CATEGORIES_CONFIG[category].label,
    count: rides.filter((r) => r.category === category).length,
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

/** Volume réussi par méthode de paiement sur la période — seules les transactions SUCCESS comptent, méthodes absentes des données omises. */
export function computePaymentsByMethod(days: number): { method: PaymentMethod; label: string; amount: number }[] {
  const cutoff = startOfDay(new Date());
  cutoff.setDate(cutoff.getDate() - days + 1);
  const payments = MOCK_PLATFORM_PAYMENTS.filter((t) => new Date(t.date) >= cutoff);
  return PAYMENT_METHOD_ORDER.map((method) => ({
    method,
    label: PAYMENT_METHOD_LABEL[method],
    amount: payments.filter((t) => t.method === method && t.status === 'SUCCESS').reduce((sum, t) => sum + t.amount, 0),
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

/** Nouveaux utilisateurs par ancienneté de compte, du plus ancien au plus récent — une tendance de croissance dérivée des vraies dates d'inscription plutôt qu'une série inventée à part. Pas de fenêtre période : c'est une photo de la base entière, pas un flux. */
export function computeUserGrowth(): { label: string; count: number }[] {
  return AGE_BUCKETS.map((bucket) => ({
    label: bucket.label,
    count: MOCK_PLATFORM_USERS.filter((u) => {
      const age = daysSince(u.createdAt);
      return age >= bucket.min && age <= bucket.max;
    }).length,
  }));
}

/** Top zones (quartier de départ) sur la période, par nombre de courses. */
export function computeRidesByZone(days: number, limit = 6): { zone: string; trips: number; revenue: number }[] {
  const rides = periodRides(days);
  const byZone = new Map<string, { trips: number; revenue: number }>();
  rides.forEach((r) => {
    const entry = byZone.get(r.pickup.label) ?? { trips: 0, revenue: 0 };
    entry.trips += 1;
    if (r.status === 'COMPLETED') entry.revenue += r.fare;
    byZone.set(r.pickup.label, entry);
  });
  return Array.from(byZone.entries())
    .map(([zone, v]) => ({ zone, ...v }))
    .sort((a, b) => b.trips - a.trips)
    .slice(0, limit);
}

const HOUR_BUCKETS = [
  { label: '0h-3h', min: 0, max: 2 },
  { label: '3h-6h', min: 3, max: 5 },
  { label: '6h-9h', min: 6, max: 8 },
  { label: '9h-12h', min: 9, max: 11 },
  { label: '12h-15h', min: 12, max: 14 },
  { label: '15h-18h', min: 15, max: 17 },
  { label: '18h-21h', min: 18, max: 20 },
  { label: '21h-24h', min: 21, max: 23 },
];

/** Répartition des courses par tranche horaire sur la période — dérivée de `requestedAt` réel. */
export function computeRidesByHour(days: number): { label: string; count: number }[] {
  const rides = periodRides(days);
  return HOUR_BUCKETS.map((bucket) => ({
    label: bucket.label,
    count: rides.filter((r) => {
      const h = new Date(r.requestedAt).getHours();
      return h >= bucket.min && h <= bucket.max;
    }).length,
  }));
}

/** Série quotidienne (taux d'annulation + note moyenne) sur `days` jours — pour les tendances Annulations/Satisfaction. */
export function computeDailyQuality(days: number): { date: string; cancellationRate: number; averageRating: number }[] {
  const today = startOfDay(new Date());
  return Array.from({ length: days }, (_, i) => {
    const offset = days - 1 - i;
    const date = new Date(today);
    date.setDate(date.getDate() - offset);
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);
    const dayRides = MOCK_PLATFORM_RIDES.filter((r) => {
      const t = new Date(r.requestedAt);
      return t >= date && t < nextDate;
    });
    const cancelled = dayRides.filter((r) => r.status === 'CANCELLED').length;
    const rated = dayRides.filter((r) => typeof r.rating === 'number');
    return {
      date: date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
      cancellationRate: dayRides.length > 0 ? Math.round((cancelled / dayRides.length) * 100) : 0,
      averageRating: rated.length > 0 ? rated.reduce((s, r) => s + (r.rating ?? 0), 0) / rated.length : 0,
    };
  });
}
