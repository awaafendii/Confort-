import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * Sans cette extension, tailwind-merge ignore les tailles de police custom du thème
 * (`text-button`, `text-body-lg`...) et les traite comme un conflit avec les couleurs
 * de texte custom (`text-primary-foreground`...) puisqu'il ne connaît que l'échelle
 * Tailwind par défaut. Résultat concret observé : sur les boutons `size="lg"`, la classe
 * de couleur du variant (`text-primary-foreground`, blanc) était silencieusement
 * supprimée par la classe de taille (`text-body-lg`), laissant le texte hériter de
 * `--foreground` (quasi noir) sur un fond bleu foncé — texte illisible sur tous les
 * boutons primary/accent/secondary/danger en taille lg.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: ['display', 'h1', 'h2', 'h3', 'body-lg', 'body', 'body-sm', 'caption', 'button'] }],
    },
  },
});

/** Fusionne des classes Tailwind en résolvant les conflits (shadcn-style). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
