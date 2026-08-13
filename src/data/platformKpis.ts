import { MOCK_PLATFORM_USERS } from './mockUsers';
import { MOCK_DRIVERS_POOL } from './mockDrivers';
import { MOCK_PLATFORM_RIDES } from './mockPlatformRides';
import type { PlatformKpis } from '@/types';

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function isSameDay(a: Date, b: Date): boolean {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

/** KPIs dérivés des jeux de données de démonstration — cohérents avec les tableaux affichés ailleurs dans l'admin. */
export function computePlatformKpis(): PlatformKpis {
  const today = new Date();
  const todayRides = MOCK_PLATFORM_RIDES.filter((r) => isSameDay(new Date(r.requestedAt), today));
  const totalUsers = MOCK_PLATFORM_USERS.length;
  const activePassengers = MOCK_PLATFORM_USERS.filter((u) => u.status === 'ACTIVE').length;
  const activeDrivers = MOCK_DRIVERS_POOL.filter((d) => d.status === 'ONLINE').length;
  const tripsToday = todayRides.length;
  const revenueToday = todayRides.filter((r) => r.status === 'COMPLETED').reduce((sum, r) => sum + r.fare, 0);
  const cancelled = todayRides.filter((r) => r.status === 'CANCELLED').length;
  const rated = todayRides.filter((r) => typeof r.rating === 'number');

  return {
    totalUsers,
    activePassengers,
    activeDrivers,
    tripsToday,
    revenueToday,
    cancellationRate: tripsToday > 0 ? cancelled / tripsToday : 0,
    averageRating: rated.length > 0 ? rated.reduce((sum, r) => sum + (r.rating ?? 0), 0) / rated.length : 0,
  };
}

/** Agrégats sur une fenêtre glissante de `days` jours (aujourd'hui inclus) — alimente le sélecteur de période du Dashboard. */
export function computePeriodStats(days: number) {
  const today = startOfDay(new Date());
  const cutoff = new Date(today);
  cutoff.setDate(cutoff.getDate() - days + 1);
  const periodRides = MOCK_PLATFORM_RIDES.filter((r) => new Date(r.requestedAt) >= cutoff);
  const cancelled = periodRides.filter((r) => r.status === 'CANCELLED');
  const rated = periodRides.filter((r) => typeof r.rating === 'number');

  return {
    trips: periodRides.length,
    revenue: periodRides.filter((r) => r.status === 'COMPLETED').reduce((sum, r) => sum + r.fare, 0),
    cancellationRate: periodRides.length > 0 ? cancelled.length / periodRides.length : 0,
    averageRating: rated.length > 0 ? rated.reduce((sum, r) => sum + (r.rating ?? 0), 0) / rated.length : 0,
  };
}

/** Série quotidienne (courses + revenus) sur `days` jours — alimente le graphique d'activité du Dashboard. */
export function buildActivitySeries(days: number) {
  const today = startOfDay(new Date());
  return Array.from({ length: days }, (_, i) => {
    const offset = days - 1 - i;
    const date = new Date(today);
    date.setDate(date.getDate() - offset);
    const dayRides = MOCK_PLATFORM_RIDES.filter((r) => isSameDay(new Date(r.requestedAt), date));
    return {
      date: date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
      trips: dayRides.length,
      revenue: dayRides.filter((r) => r.status === 'COMPLETED').reduce((sum, r) => sum + r.fare, 0),
    };
  });
}

/** Série de démonstration pour le graphique "courses & revenus des 7 derniers jours". */
export const WEEKLY_TRIPS_SERIES = [
  { day: 'Lun', trips: 32, revenue: 96000 },
  { day: 'Mar', trips: 41, revenue: 123000 },
  { day: 'Mer', trips: 38, revenue: 114000 },
  { day: 'Jeu', trips: 45, revenue: 148000 },
  { day: 'Ven', trips: 58, revenue: 189000 },
  { day: 'Sam', trips: 63, revenue: 205000 },
  { day: 'Dim', trips: 49, revenue: 156000 },
];
