import { SERVICE_REGISTRY } from '@/features/services/serviceRegistry';
import type { ServiceItem } from '@/components/service/ServiceCard';

/** Dérivée du serviceRegistry (source de vérité unique) — pas de liste dupliquée à la main. */
export const PASSENGER_SERVICES: ServiceItem[] = SERVICE_REGISTRY.map((service) => ({
  id: service.id,
  name: service.name,
  image: service.image,
  comingSoon: !service.enabled,
  selfContained: service.selfContained,
}));
