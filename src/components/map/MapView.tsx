import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapControls } from './MapControls';
import { cn } from '@/lib/utils';
import type { GeoPoint, VehicleType } from '@/types';

/**
 * Style de tuiles vectorielles gratuit et sans clé (OpenFreeMap). L'app
 * ne dépend d'aucun token — voir src/services/mapService.ts pour le
 * raisonnement complet (le provider Mapbox demandé initialement pourra
 * être branché plus tard sans toucher aux écrans consommateurs).
 */
const STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';
const ROUTE_SOURCE_ID = 'confort-plus-route';
const ROUTE_LAYER_ID = 'confort-plus-route-line';

const LIGHT_HEX = new Set(['#FFFFFF', '#C7CBD1', '#D8C6A7']);

/** Icône moto — reste en trait SVG générique : aucune icône vue-du-dessus isolée équivalente à la voiture n'existe dans la planche source (Confort+_img.png). */
const BIKE_ICON = '<circle cx="6" cy="17" r="3"/><circle cx="18" cy="17" r="3"/><path d="M6 17l4-8h4l3 4"/><path d="M10 9h4"/>';
/** Icône voiture vue du dessus, recadrée depuis Confort+_img.png — reste lisible sous rotation CSS, contrairement à une photo 3/4. */
const CAR_MARKER_SRC = '/assets/markers/vehicle-car.png';

export interface MapMarkerSpec {
  id: string;
  position: GeoPoint;
  kind: 'vehicle' | 'pin';
  color: string;
  vehicleType?: VehicleType;
  rotation?: number;
}

export interface MapViewProps {
  center: GeoPoint;
  zoom?: number;
  markers?: MapMarkerSpec[];
  route?: GeoPoint[];
  interactive?: boolean;
  /** Boutons zoom/géolocalisation superposés — indépendants du flag `interactive` (l'API JS de maplibre-gl fonctionne même sur une carte sans gestes utilisateur). Désactivé sur les vignettes statiques (ex. AdminRideDetailPage). */
  showControls?: boolean;
  className?: string;
}

function createMarkerElement(spec: MapMarkerSpec): HTMLDivElement {
  const el = document.createElement('div');
  if (spec.kind === 'pin') {
    el.style.cssText = `width:16px;height:16px;border-radius:9999px;background:${spec.color};border:3px solid #fff;box-shadow:0 1px 4px rgba(16,21,28,.35);`;
    return el;
  }
  el.style.cssText = `width:34px;height:34px;border-radius:9999px;background:${spec.color};border:2px solid #fff;box-shadow:0 2px 8px rgba(16,21,28,.3);display:flex;align-items:center;justify-content:center;`;
  if (spec.vehicleType === 'MOTO') {
    const stroke = LIGHT_HEX.has(spec.color.toUpperCase()) ? '#10151C' : '#FFFFFF';
    el.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${BIKE_ICON}</svg>`;
  } else {
    el.innerHTML = `<img src="${CAR_MARKER_SRC}" width="20" height="20" style="object-fit:contain;filter:drop-shadow(0 0 1px #fff)" alt="" />`;
  }
  return el;
}

/** Wrapper MapLibre réutilisable — seul fichier de l'app à importer `maplibre-gl`. */
export const MapView: React.FC<MapViewProps> = ({
  center,
  zoom = 13,
  markers = [],
  route,
  interactive = true,
  showControls = true,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<Map<string, maplibregl.Marker>>(new Map());
  const loadedRef = useRef(false);
  const [mapInstance, setMapInstance] = useState<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: STYLE_URL,
      center: [center.lng, center.lat],
      zoom,
      attributionControl: false,
      interactive,
    });
    mapRef.current = map;
    setMapInstance(map);

    map.on('load', () => {
      loadedRef.current = true;
      map.addSource(ROUTE_SOURCE_ID, {
        type: 'geojson',
        data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [] } },
      });
      // Couche "glow" sous la ligne pleine — même source, ajoutée en premier pour rendre dessous.
      map.addLayer({
        id: `${ROUTE_LAYER_ID}-glow`,
        type: 'line',
        source: ROUTE_SOURCE_ID,
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': '#102A43', 'line-width': 10, 'line-opacity': 0.18, 'line-blur': 4 },
      });
      map.addLayer({
        id: ROUTE_LAYER_ID,
        type: 'line',
        source: ROUTE_SOURCE_ID,
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        // #102A43 = primary-800 (Confort+ design system) — l'ancien hex #0F2A4D datait de WONKHAI.
        paint: { 'line-color': '#102A43', 'line-width': 4, 'line-opacity': 0.85 },
      });
    });

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current.clear();
      setMapInstance(null);
      map.remove();
      mapRef.current = null;
      loadedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const seen = new Set<string>();
    markers.forEach((spec) => {
      seen.add(spec.id);
      const existing = markersRef.current.get(spec.id);
      if (!existing) {
        const marker = new maplibregl.Marker({ element: createMarkerElement(spec), rotationAlignment: 'map' })
          .setLngLat([spec.position.lng, spec.position.lat])
          .setRotation(spec.rotation ?? 0)
          .addTo(map);
        markersRef.current.set(spec.id, marker);
      } else {
        existing.setLngLat([spec.position.lng, spec.position.lat]);
        if (spec.rotation !== undefined) existing.setRotation(spec.rotation);
      }
    });
    markersRef.current.forEach((marker, id) => {
      if (!seen.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
      }
    });
  }, [markers]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !route) return;
    const apply = () => {
      const source = map.getSource(ROUTE_SOURCE_ID) as maplibregl.GeoJSONSource | undefined;
      if (!source) return;
      source.setData({
        type: 'Feature',
        properties: {},
        geometry: { type: 'LineString', coordinates: route.map((p) => [p.lng, p.lat]) },
      });
      if (route.length >= 2) {
        const bounds = route.reduce(
          (b, p) => b.extend([p.lng, p.lat]),
          new maplibregl.LngLatBounds([route[0].lng, route[0].lat], [route[0].lng, route[0].lat])
        );
        map.fitBounds(bounds, { padding: 64, duration: 600 });
      }
    };
    if (loadedRef.current) apply();
    else map.once('load', apply);
  }, [route]);

  return (
    <div className={cn('relative', className)} style={{ width: '100%', height: '100%' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      {showControls && mapInstance && <MapControls map={mapInstance} />}
    </div>
  );
};
