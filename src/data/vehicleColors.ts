import type { VehicleColorId } from '@/types';

/**
 * Palette des couleurs réelles de véhicules — utilisée pour représenter
 * chaque voiture/moto sur la carte avec sa couleur exacte (marqueur +
 * silhouette), à la manière de Yango sur Dakar. Distincte de la palette
 * de marque Confort+ (bleu nuit / vert profond).
 */
export const VEHICLE_COLORS: Record<VehicleColorId, { label: string; hex: string; markerHex: string }> = {
  blanc: { label: 'Blanc', hex: '#FFFFFF', markerHex: '#E7EAEE' },
  noir: { label: 'Noir', hex: '#1A1A1E', markerHex: '#1A1A1E' },
  gris: { label: 'Gris', hex: '#8B92A0', markerHex: '#8B92A0' },
  argent: { label: 'Argent', hex: '#C7CBD1', markerHex: '#AEB4BD' },
  rouge: { label: 'Rouge', hex: '#C1272D', markerHex: '#C1272D' },
  bleu: { label: 'Bleu', hex: '#2559C7', markerHex: '#2559C7' },
  vert: { label: 'Vert', hex: '#1B6854', markerHex: '#1B6854' },
  beige: { label: 'Beige', hex: '#D8C6A7', markerHex: '#C4AF89' },
};

export const VEHICLE_COLOR_IDS = Object.keys(VEHICLE_COLORS) as VehicleColorId[];
