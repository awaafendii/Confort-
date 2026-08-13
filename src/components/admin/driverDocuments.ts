import type { DriverDocument } from '@/types';

export const DOC_TYPES: { type: DriverDocument['type']; label: string }[] = [
  { type: 'PERMIS', label: 'Permis de conduire' },
  { type: 'CARTE_IDENTITE', label: "Carte d'identité" },
  { type: 'CARTE_GRISE', label: 'Carte grise' },
  { type: 'ASSURANCE', label: 'Assurance' },
];

export const DOC_STATUS_BADGE: Record<DriverDocument['status'] | 'MISSING', { label: string; variant: 'success' | 'warning' | 'danger' | 'neutral' }> = {
  VALIDATED: { label: 'Validé', variant: 'success' },
  PENDING: { label: 'En cours de vérification', variant: 'warning' },
  REJECTED: { label: 'Rejeté', variant: 'danger' },
  MISSING: { label: 'Non fourni', variant: 'neutral' },
};

export function isImageUrl(url: string): boolean {
  return url.startsWith('data:image') || /\.(png|jpe?g|webp|gif)(\?|$)/i.test(url) || url.includes('placehold.co');
}

/** Compte les documents validés sur le total attendu, et signale s'il reste des documents à traiter (attente ou rejet). */
export function summarizeDocuments(documents: DriverDocument[]): { validated: number; total: number; needsAttention: boolean } {
  const validated = documents.filter((d) => d.status === 'VALIDATED').length;
  const needsAttention = documents.some((d) => d.status === 'PENDING' || d.status === 'REJECTED') || documents.length < DOC_TYPES.length;
  return { validated, total: DOC_TYPES.length, needsAttention };
}
