import { SERVICE_ASSETS } from '@/config/assets';
import type { ServiceItem } from '@/components/service/ServiceCard';

/** Grille de services de la home passager — seul 'ride' mène à un vrai flux (SearchDestinationPage) ; les autres sont annoncés visuellement mais désactivés, aucune logique livraison/cargo/food/business/aéroport n'existant dans l'app aujourd'hui (Phase 8). */
export const PASSENGER_SERVICES: ServiceItem[] = [
  { id: 'ride', name: 'Courses', image: SERVICE_ASSETS.ride },
  { id: 'delivery', name: 'Livraison', image: SERVICE_ASSETS.delivery, comingSoon: true },
  { id: 'food', name: 'Food', image: SERVICE_ASSETS.food, comingSoon: true },
  { id: 'cargo', name: 'Cargo', image: SERVICE_ASSETS.cargo, comingSoon: true },
  { id: 'business', name: 'Business', image: SERVICE_ASSETS.business, comingSoon: true },
  { id: 'airport', name: 'Aéroport', image: SERVICE_ASSETS.airport, comingSoon: true },
];
