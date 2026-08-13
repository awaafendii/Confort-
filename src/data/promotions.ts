import { CAMPAIGN_ASSETS } from '@/config/assets';
import type { PromotionItem } from '@/components/promotion/PromotionCard';

/** Campagnes home passager — visuels réels, texte/CTA déjà composés dans l'image (`selfContained`). 'become-driver' mène vers /register, 'safety' vers la page Sécurité ; 'business' et 'delivery' restent des bannières teaser non cliquables tant que ces services n'existent pas (Phase 8). */
export const PASSENGER_PROMOTIONS: PromotionItem[] = [
  {
    id: 'become-driver',
    image: CAMPAIGN_ASSETS.becomeDriver,
    title: 'Devenez chauffeur Confort+',
    selfContained: true,
  },
  {
    id: 'safety',
    image: CAMPAIGN_ASSETS.safety,
    title: 'Votre sécurité, notre priorité',
    selfContained: true,
  },
  {
    id: 'delivery',
    image: CAMPAIGN_ASSETS.delivery,
    title: 'Livraison — bientôt disponible',
    selfContained: true,
  },
  {
    id: 'business',
    image: CAMPAIGN_ASSETS.business,
    title: 'Confort+ Business — bientôt disponible',
    selfContained: true,
  },
];
