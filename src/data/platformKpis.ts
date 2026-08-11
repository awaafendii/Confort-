import { MOCK_PLATFORM_USERS } from './mockUsers';
import { MOCK_DRIVERS_POOL } from './mockDrivers';
import { MOCK_PLATFORM_RIDES } from './mockPlatformRides';
import type { PlatformKpis } from '@/types';

/** KPIs dérivés des jeux de données de démonstration — cohérents avec les tableaux affichés ailleurs dans l'admin. */
export function computePlatformKpis(): PlatformKpis {
  const totalUsers = MOCK_PLATFORM_USERS.length;
  const activeDrivers = MOCK_DRIVERS_POOL.filter((d) => d.status === 'ONLINE').length;
  const tripsToday = MOCK_PLATFORM_RIDES.length;
  const revenueToday = MOCK_PLATFORM_RIDES.filter((r) => r.status === 'COMPLETED').reduce((sum, r) => sum + r.fare, 0);
  const cancelled = MOCK_PLATFORM_RIDES.filter((r) => r.status === 'CANCELLED').length;
  const rated = MOCK_PLATFORM_RIDES.filter((r) => typeof r.rating === 'number');

  return {
    totalUsers,
    activeDrivers,
    tripsToday,
    revenueToday,
    cancellationRate: tripsToday > 0 ? cancelled / tripsToday : 0,
    averageRating: rated.length > 0 ? rated.reduce((sum, r) => sum + (r.rating ?? 0), 0) / rated.length : 0,
  };
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
