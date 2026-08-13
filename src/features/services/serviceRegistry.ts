import { SERVICE_ASSETS } from '@/config/assets';
import type { ServiceDefinition } from './types';

/**
 * Registre unique de tous les services Confort+, activés ou non. La grille de services (Home) et
 * la navigation en dérivent toutes les deux — ajouter/retirer un service ou changer son point
 * d'entrée se fait ici, nulle part ailleurs. Seuls 'ride' et 'delivery' sont `enabled: true`
 * aujourd'hui : ce sont les deux seuls services pour lesquels un vrai parcours de réservation
 * (recherche → réservation → mise en relation → suivi) existe dans l'app.
 */
export const SERVICE_REGISTRY: ServiceDefinition[] = [
  { id: 'ride', name: 'Courses', image: SERVICE_ASSETS.ride, category: 'mobility', bookingType: 'instant', enabled: true, entryRoute: '/passenger/search' },
  { id: 'delivery', name: 'Livraison', image: SERVICE_ASSETS.delivery, category: 'delivery', bookingType: 'instant', enabled: true, entryRoute: '/passenger/delivery' },
  { id: 'food', name: 'Food', image: SERVICE_ASSETS.food, category: 'commerce', bookingType: 'marketplace', enabled: false },
  { id: 'cargo', name: 'Cargo', image: SERVICE_ASSETS.cargo, category: 'logistics', bookingType: 'quote', enabled: false },
  { id: 'business', name: 'Business', image: SERVICE_ASSETS.business, category: 'business', bookingType: 'scheduled', enabled: false },
  { id: 'airport', name: 'Aéroport', image: SERVICE_ASSETS.airport, category: 'special', bookingType: 'scheduled', enabled: false },
];

export function getService(id: string): ServiceDefinition | undefined {
  return SERVICE_REGISTRY.find((s) => s.id === id);
}
