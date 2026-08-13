export type ServiceCategory = 'mobility' | 'delivery' | 'logistics' | 'commerce' | 'business' | 'special';
export type ServiceBookingType = 'instant' | 'quote' | 'marketplace' | 'scheduled';

/**
 * Description d'un service Confort+ — source de vérité unique pour la grille de services (Home)
 * et le point d'entrée de réservation, plutôt que des `if (service === '...')` dispersés dans les
 * pages. `enabled: false` = visible (effet "super-app") mais non cliquable, avec un badge "Bientôt"
 * porté par le composant d'affichage, pas par cette donnée (séparation contenu/présentation).
 */
export interface ServiceDefinition {
  id: string;
  name: string;
  image: string;
  category: ServiceCategory;
  bookingType: ServiceBookingType;
  enabled: boolean;
  /** Route de démarrage du parcours de réservation — présent uniquement si `enabled`. */
  entryRoute?: string;
  /** true quand `image` contient déjà son propre libellé composé dans le visuel — évite un doublon de texte (même pattern que `PromotionItem.selfContained`). */
  selfContained?: boolean;
}
