import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Clock, Home, MapPin, Navigation } from 'lucide-react';
import { BackButton, EmptyState, SearchInput, Skeleton, SkeletonGroup } from '@/components/ui';
import { useSavedPlacesStore } from '@/features/profile/savedPlacesStore';
import { NEIGHBORHOODS, getNeighborhood } from '@/data/neighborhoods';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';
import type { SavedPlace } from '@/types';

const ORIGIN_ID = 'kaloum';
const RECENT_IDS = ['aeroport', 'madina'];

/** Fait correspondre un lieu enregistré à un quartier réservable (le graphe tarifaire ne connaît que ces 12 quartiers) — même règle que PassengerHomePage. */
function resolveNeighborhoodId(place?: SavedPlace): string | undefined {
  if (!place) return undefined;
  return NEIGHBORHOODS.find((n) => place.address.includes(n.name))?.id;
}

function PlaceRow({
  icon,
  title,
  subtitle,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3.5 rounded-lg px-2 py-3 text-left transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-800">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="truncate text-body font-medium text-foreground">{title}</p>
        <p className="text-caption text-muted-foreground">{subtitle}</p>
      </div>
    </button>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="mb-2 text-caption font-semibold uppercase tracking-wide text-muted-foreground">{children}</p>;
}

export default function SearchDestinationPage() {
  const navigate = useNavigate();
  const places = useSavedPlacesStore((s) => s.places);
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 200);

  const isTyping = query.trim().length > 0 && query.trim() !== debouncedQuery.trim();

  const results = useMemo(() => {
    if (!debouncedQuery.trim()) return null;
    const q = debouncedQuery.trim().toLowerCase();
    return NEIGHBORHOODS.filter((n) => n.name.toLowerCase().includes(q));
  }, [debouncedQuery]);

  const home = places.find((p) => p.label === 'Home');
  const work = places.find((p) => p.label === 'Work');

  const selectDestination = (id: string) => {
    navigate('/passenger/booking', { state: { destinationId: id } });
  };

  const selectSavedPlace = (place: SavedPlace | undefined) => {
    const neighborhoodId = resolveNeighborhoodId(place);
    if (neighborhoodId) selectDestination(neighborhoodId);
    else navigate('/passenger/profile/saved-places');
  };

  return (
    <div className={cn('mx-auto min-h-screen max-w-md bg-background px-5 pb-10 pt-6', 'lg:max-w-xl')}>
      <BackButton label="Retour" className="mb-2" />
      <p className="mb-5 font-display text-h2 text-foreground">Où allez-vous ?</p>

      <div className="mb-4 flex items-center gap-3 rounded-md border border-input bg-surface px-4 py-3">
        <Navigation className="h-4 w-4 shrink-0 text-accent-600" aria-hidden="true" />
        <div className="min-w-0">
          <p className="text-caption text-muted-foreground">Départ</p>
          <p className="truncate text-body-sm font-medium text-foreground">{getNeighborhood(ORIGIN_ID)?.name}, Conakry</p>
        </div>
      </div>

      <div className="mb-2">
        <SearchInput value={query} onChange={setQuery} autoFocus placeholder="Rechercher un quartier de Conakry" />
      </div>

      {isTyping ? (
        <SkeletonGroup label="Recherche en cours" className="mt-6 space-y-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3.5 px-2 py-3">
              <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-2.5 w-1/5" />
              </div>
            </div>
          ))}
        </SkeletonGroup>
      ) : results === null ? (
        <div className="mt-4 space-y-6">
          <div>
            <SectionLabel>Lieux enregistrés</SectionLabel>
            <div className="space-y-1">
              <PlaceRow icon={<Home className="h-4 w-4" />} title="Domicile" subtitle={home?.address ?? 'Ajouter une adresse'} onClick={() => selectSavedPlace(home)} />
              <PlaceRow icon={<Briefcase className="h-4 w-4" />} title="Travail" subtitle={work?.address ?? 'Ajouter une adresse'} onClick={() => selectSavedPlace(work)} />
            </div>
          </div>

          <div>
            <SectionLabel>Récents</SectionLabel>
            <div className="space-y-1">
              {RECENT_IDS.map((id) => {
                const n = getNeighborhood(id);
                if (!n) return null;
                return (
                  <PlaceRow key={id} icon={<Clock className="h-4 w-4" />} title={n.name} subtitle="Conakry" onClick={() => selectDestination(id)} />
                );
              })}
            </div>
          </div>

          <div>
            <SectionLabel>Quartiers desservis</SectionLabel>
            <div className="space-y-1">
              {NEIGHBORHOODS.map((n) => (
                <PlaceRow key={n.id} icon={<MapPin className="h-4 w-4" />} title={n.name} subtitle="Conakry" onClick={() => selectDestination(n.id)} />
              ))}
            </div>
          </div>
        </div>
      ) : results.length === 0 ? (
        <EmptyState icon={<MapPin className="h-7 w-7" />} title="Aucun résultat" description="Essayez un autre nom de quartier." className="mt-6" />
      ) : (
        <div className="mt-4 space-y-1">
          {results.map((n) => (
            <PlaceRow key={n.id} icon={<MapPin className="h-4 w-4" />} title={n.name} subtitle="Conakry" onClick={() => selectDestination(n.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
