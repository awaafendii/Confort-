import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { History, SearchX } from 'lucide-react';
import { EmptyState, FilterChips, SearchInput, type StatusConfig } from '@/components/ui';
import { RideCard } from '@/components/business';
import { useDriverRideHistoryStore } from '@/features/rides/driverRideHistoryStore';
import { formatFare } from '@/utils/format';
import type { RideStatus } from '@/types';

const STATUS_BADGE: Record<RideStatus, StatusConfig> = {
  COMPLETED: { label: 'Terminée', variant: 'success' },
  CANCELLED: { label: 'Annulée', variant: 'danger' },
  REQUESTED: { label: 'Demandée', variant: 'neutral' },
  SEARCHING_DRIVER: { label: 'Recherche', variant: 'neutral' },
  DRIVER_ASSIGNED: { label: 'Assignée', variant: 'neutral' },
  DRIVER_ARRIVING: { label: 'En approche', variant: 'neutral' },
  DRIVER_ARRIVED: { label: 'Chauffeur arrivé', variant: 'neutral' },
  IN_PROGRESS: { label: 'En cours', variant: 'neutral' },
};

type StatusFilter = 'ALL' | 'COMPLETED' | 'CANCELLED';

const FILTER_OPTIONS: { id: StatusFilter; label: string }[] = [
  { id: 'ALL', label: 'Toutes' },
  { id: 'COMPLETED', label: 'Terminées' },
  { id: 'CANCELLED', label: 'Annulées' },
];

export default function DriverTripsPage() {
  const navigate = useNavigate();
  const driverRides = useDriverRideHistoryStore((s) => s.rides);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<StatusFilter>('ALL');

  const filteredRides = useMemo(() => {
    const q = search.trim().toLowerCase();
    return driverRides.filter((ride) => {
      if (filter !== 'ALL' && ride.status !== filter) return false;
      if (!q) return true;
      return ride.pickup.label.toLowerCase().includes(q) || ride.destination.label.toLowerCase().includes(q);
    });
  }, [driverRides, search, filter]);

  const completedTotal = filteredRides.filter((r) => r.status === 'COMPLETED').reduce((sum, r) => sum + r.fare, 0);

  return (
    <div className="mx-auto max-w-md px-5 pb-10 pt-8 lg:max-w-2xl lg:px-8">
      <h1 className="font-display text-h2 text-foreground lg:hidden">Courses</h1>

      {driverRides.length === 0 ? (
        <EmptyState icon={<History className="h-7 w-7" />} title="Aucune course" description="Vos courses effectuées apparaîtront ici." className="mt-6" />
      ) : (
        <>
          <div className="mt-6 space-y-3">
            <SearchInput value={search} onChange={setSearch} placeholder="Rechercher un trajet" />
            <FilterChips label="Filtrer par statut" options={FILTER_OPTIONS} value={filter} onChange={setFilter} />
          </div>

          <p className="mt-4 text-caption text-muted-foreground">
            {filteredRides.length} course{filteredRides.length > 1 ? 's' : ''} · {formatFare(completedTotal)} gagnés
          </p>

          {filteredRides.length === 0 ? (
            <EmptyState
              icon={<SearchX className="h-7 w-7" />}
              title="Aucun résultat"
              description="Essayez un autre quartier ou un autre filtre."
              className="mt-6"
            />
          ) : (
            <div className="mt-4 space-y-3">
              {filteredRides.map((ride) => (
                <RideCard key={ride.id} ride={ride} statusConfig={STATUS_BADGE} onClick={() => navigate(`/driver/trips/${ride.id}`)} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
