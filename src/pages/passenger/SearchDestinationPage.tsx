import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, MapPin, Navigation } from 'lucide-react';
import { EmptyState, SearchInput } from '@/components/ui';
import { NEIGHBORHOODS, getNeighborhood } from '@/data/neighborhoods';
import { useDebounce } from '@/hooks/useDebounce';

const ORIGIN_ID = 'kaloum';
const RECENT_IDS = ['aeroport', 'madina'];

export default function SearchDestinationPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 200);

  const results = useMemo(() => {
    if (!debouncedQuery.trim()) return null;
    const q = debouncedQuery.trim().toLowerCase();
    return NEIGHBORHOODS.filter((n) => n.name.toLowerCase().includes(q));
  }, [debouncedQuery]);

  const selectDestination = (id: string) => {
    navigate('/passenger/booking', { state: { destinationId: id } });
  };

  return (
    <div className="mx-auto min-h-screen max-w-md bg-background px-5 pb-10 pt-6">
      <div className="mb-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} aria-label="Retour" className="tap-target flex items-center justify-center rounded-full text-muted-foreground hover:bg-surface">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <p className="font-display text-h3 text-foreground">Où allez-vous ?</p>
      </div>

      <div className="mb-1 flex items-center gap-3 rounded-xl border border-dashed border-border px-4 py-2.5">
        <Navigation className="h-4 w-4 shrink-0 text-secondary-700" />
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">Départ</p>
          <p className="truncate text-sm font-medium text-foreground">Position actuelle (simulée) — {getNeighborhood(ORIGIN_ID)?.name}</p>
        </div>
      </div>

      <div className="my-4">
        <SearchInput value={query} onChange={setQuery} autoFocus placeholder="Rechercher un quartier de Conakry" />
      </div>

      {results === null ? (
        <div className="space-y-6">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Récents</p>
            <div className="space-y-1">
              {RECENT_IDS.map((id) => {
                const n = getNeighborhood(id);
                if (!n) return null;
                return (
                  <button
                    key={id}
                    onClick={() => selectDestination(id)}
                    className="flex w-full items-center gap-3.5 rounded-xl px-2 py-3 text-left hover:bg-surface"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface text-muted-foreground">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[15px] font-medium text-foreground">{n.name}</p>
                      <p className="text-xs text-muted-foreground">Conakry</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Quartiers desservis</p>
            <div className="space-y-1">
              {NEIGHBORHOODS.map((n) => (
                <button
                  key={n.id}
                  onClick={() => selectDestination(n.id)}
                  className="flex w-full items-center gap-3.5 rounded-xl px-2 py-3 text-left hover:bg-surface"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary-800">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[15px] font-medium text-foreground">{n.name}</p>
                    <p className="text-xs text-muted-foreground">Conakry</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : results.length === 0 ? (
        <EmptyState icon={<MapPin className="h-7 w-7" />} title="Aucun résultat" description="Essayez un autre nom de quartier." className="mt-6" />
      ) : (
        <div className="space-y-1">
          {results.map((n) => (
            <button
              key={n.id}
              onClick={() => selectDestination(n.id)}
              className="flex w-full items-center gap-3.5 rounded-xl px-2 py-3 text-left hover:bg-surface"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary-800">
                <MapPin className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[15px] font-medium text-foreground">{n.name}</p>
                <p className="text-xs text-muted-foreground">Conakry</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
