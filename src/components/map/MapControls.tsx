import React from 'react';
import type maplibregl from 'maplibre-gl';
import { LocateFixed, Minus, Plus } from 'lucide-react';
import { IconButton, toast } from '@/components/ui';

export interface MapControlsProps {
  map: maplibregl.Map;
  className?: string;
}

const BUTTON_CLASS = 'bg-surface/95 shadow-card backdrop-blur hover:bg-surface';

/** Boutons de zoom/géolocalisation superposés à la carte (MapView) — la carte de base reste souvent `interactive={false}` (pour ne pas entrer en conflit avec le geste de swipe du BottomSheet), mais l'API JS de maplibre-gl fonctionne indépendamment de ce flag. */
export const MapControls: React.FC<MapControlsProps> = ({ map, className }) => {
  const locate = () => {
    if (!('geolocation' in navigator)) {
      toast('Localisation indisponible sur cet appareil.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        map.flyTo({
          center: [pos.coords.longitude, pos.coords.latitude],
          zoom: Math.max(map.getZoom(), 15),
          duration: 800,
        });
      },
      () => toast('Localisation indisponible — vérifiez les autorisations.'),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  return (
    <div className={className ?? 'absolute right-4 top-4 z-10 flex flex-col gap-2'}>
      <IconButton
        icon={<Plus className="h-4 w-4" />}
        aria-label="Zoomer"
        size="sm"
        className={BUTTON_CLASS}
        onClick={() => map.zoomIn({ duration: 200 })}
      />
      <IconButton
        icon={<Minus className="h-4 w-4" />}
        aria-label="Dézoomer"
        size="sm"
        className={BUTTON_CLASS}
        onClick={() => map.zoomOut({ duration: 200 })}
      />
      <IconButton
        icon={<LocateFixed className="h-4 w-4" />}
        aria-label="Me localiser"
        size="sm"
        className={BUTTON_CLASS}
        onClick={locate}
      />
    </div>
  );
};
