import type { StatusConfig } from '@/components/ui';
import type { RideStatus } from '@/types';

/**
 * Config de statut de course centralisée pour l'espace admin — dupliquée à l'identique
 * dans AdminDashboardPage/AdminRidesPage/UserDetailsDrawer/AdminDriverDetailPage avant ce
 * fichier (audit § 3.3, "STATUS_BADGE dupliqué à l'identique"). Les 8 statuts (pas
 * seulement Terminée/Annulée/En cours) pour que les filtres puissent tous les couvrir.
 */
export const RIDE_STATUS_CONFIG: Record<RideStatus, StatusConfig> = {
  REQUESTED: { label: 'Demandée', variant: 'neutral' },
  SEARCHING_DRIVER: { label: 'Recherche', variant: 'neutral' },
  DRIVER_ASSIGNED: { label: 'Assignée', variant: 'neutral' },
  DRIVER_ARRIVING: { label: 'En approche', variant: 'neutral' },
  DRIVER_ARRIVED: { label: 'Chauffeur arrivé', variant: 'neutral' },
  IN_PROGRESS: { label: 'En cours', variant: 'accent' },
  COMPLETED: { label: 'Terminée', variant: 'success' },
  CANCELLED: { label: 'Annulée', variant: 'danger' },
};

/** Ordre canonique d'une course qui va à son terme — sert à bâtir la timeline de statut (sans horodatage fabriqué pour les étapes intermédiaires). */
export const RIDE_STATUS_ORDER: RideStatus[] = [
  'REQUESTED',
  'SEARCHING_DRIVER',
  'DRIVER_ASSIGNED',
  'DRIVER_ARRIVING',
  'DRIVER_ARRIVED',
  'IN_PROGRESS',
  'COMPLETED',
];
