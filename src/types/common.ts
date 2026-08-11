export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface Neighborhood {
  id: string;
  name: string;
  /** Coordonnées réelles (WGS84) pour Mapbox. */
  coords: GeoPoint;
}

export type AsyncState = 'idle' | 'loading' | 'success' | 'error' | 'empty';
