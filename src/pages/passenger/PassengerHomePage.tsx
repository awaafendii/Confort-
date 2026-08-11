import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Briefcase, Clock, Home, Search } from 'lucide-react';
import { Avatar, Card } from '@/components/ui';
import { MapView } from '@/components/map/MapView';
import { useAuthStore } from '@/features/auth/store';
import { useSavedPlacesStore } from '@/features/profile/savedPlacesStore';
import { NEIGHBORHOODS, CONAKRY_MAP_CENTER } from '@/data/neighborhoods';
import { NEARBY_VEHICLE_MARKERS } from '@/data/nearbyVehicleMarkers';
import type { SavedPlace } from '@/types';

/** Fait correspondre un lieu enregistré à un quartier réservable (le graphe tarifaire ne connaît que ces 12 quartiers). */
function resolveNeighborhoodId(place?: SavedPlace): string | undefined {
  if (!place) return undefined;
  return NEIGHBORHOODS.find((n) => place.address.includes(n.name))?.id;
}

export default function PassengerHomePage() {
  const navigate = useNavigate();
  const account = useAuthStore((s) => s.account);
  const places = useSavedPlacesStore((s) => s.places);
  if (!account) return null;

  const firstName = account.name.split(' ')[0];
  const home = places.find((p) => p.label === 'Home');
  const work = places.find((p) => p.label === 'Work');

  const bookOrManage = (place: SavedPlace | undefined) => {
    const neighborhoodId = resolveNeighborhoodId(place);
    if (neighborhoodId) navigate('/passenger/booking', { state: { destinationId: neighborhoodId } });
    else navigate('/passenger/profile/saved-places');
  };

  return (
    <div className="mx-auto max-w-md px-5 pb-10 pt-8 lg:max-w-2xl lg:px-8">
      <div className="mb-6 flex items-center justify-between lg:hidden">
        <div>
          <p className="text-sm text-muted-foreground">Bonjour,</p>
          <p className="font-display text-h3 text-foreground">{firstName}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/passenger/notifications')}
            aria-label="Notifications"
            className="tap-target flex items-center justify-center rounded-full text-muted-foreground hover:bg-surface"
          >
            <Bell className="h-5 w-5" />
          </button>
          <button onClick={() => navigate('/passenger/profile')} aria-label="Profil">
            <Avatar name={account.name} src={account.avatar} size="sm" />
          </button>
        </div>
      </div>

      <button
        onClick={() => navigate('/passenger/search')}
        className="mb-6 flex h-12 w-full items-center gap-3 rounded-xl border border-input bg-background px-4 text-[15px] text-muted-foreground"
      >
        <Search className="h-4 w-4" />
        Où allez-vous ?
      </button>

      <div className="mb-8 grid grid-cols-3 gap-3">
        <button
          onClick={() => bookOrManage(home)}
          className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-background p-4 text-center hover:border-primary-200"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-800">
            <Home className="h-5 w-5" />
          </div>
          <span className="text-xs font-medium text-foreground">Domicile</span>
        </button>
        <button
          onClick={() => bookOrManage(work)}
          className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-background p-4 text-center hover:border-primary-200"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-800">
            <Briefcase className="h-5 w-5" />
          </div>
          <span className="text-xs font-medium text-foreground">Travail</span>
        </button>
        <button
          onClick={() => navigate('/passenger/search')}
          className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-background p-4 text-center hover:border-primary-200"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-800">
            <Clock className="h-5 w-5" />
          </div>
          <span className="text-xs font-medium text-foreground">Récents</span>
        </button>
      </div>

      <Card noPadding className="overflow-hidden">
        <div className="h-48 w-full">
          <MapView center={CONAKRY_MAP_CENTER} zoom={12.3} markers={NEARBY_VEHICLE_MARKERS} interactive={false} />
        </div>
        <div className="p-4">
          <p className="text-sm font-semibold text-foreground">Chauffeurs disponibles près de vous</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Réservez une course pour suivre votre chauffeur en temps réel sur la carte.
          </p>
        </div>
      </Card>
    </div>
  );
}
