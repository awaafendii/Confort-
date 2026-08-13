import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FilterChips, SearchInput } from '@/components/ui';
import { RideTable, RIDE_STATUS_CONFIG } from '@/components/admin';
import { MOCK_PLATFORM_USERS } from '@/data/mockUsers';
import { MOCK_DRIVERS_POOL } from '@/data/mockDrivers';
import { useAdminStore } from '@/features/admin/adminStore';
import { MOCK_PLATFORM_RIDES } from '@/data/mockPlatformRides';
import type { RideStatus } from '@/types';

type FilterId = 'ALL' | RideStatus;

const FILTERS: { id: FilterId; label: string }[] = [
  { id: 'ALL', label: 'Toutes' },
  ...(Object.keys(RIDE_STATUS_CONFIG) as RideStatus[]).map((id) => ({ id, label: RIDE_STATUS_CONFIG[id].label })),
];

function nameFor(id: string, drivers: { id: string; name: string }[]): string {
  return (
    MOCK_PLATFORM_USERS.find((u) => u.id === id)?.name ??
    drivers.find((d) => d.id === id)?.name ??
    MOCK_DRIVERS_POOL.find((d) => d.id === id)?.name ??
    id
  );
}

export default function AdminRidesPage() {
  const navigate = useNavigate();
  const drivers = useAdminStore((s) => s.drivers);
  const [filter, setFilter] = useState<FilterId>('ALL');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const byStatus = filter === 'ALL' ? MOCK_PLATFORM_RIDES : MOCK_PLATFORM_RIDES.filter((r) => r.status === filter);
    const query = search.trim().toLowerCase();
    if (!query) return byStatus;
    return byStatus.filter((r) => {
      const trajet = `${r.pickup.label} ${r.destination.label}`.toLowerCase();
      const passenger = nameFor(r.passengerId, drivers).toLowerCase();
      const driver = r.driverId ? nameFor(r.driverId, drivers).toLowerCase() : '';
      return trajet.includes(query) || passenger.includes(query) || driver.includes(query);
    });
  }, [filter, search, drivers]);

  return (
    <div className="mx-auto max-w-6xl px-5 pb-10 pt-8 lg:px-8">
      <h1 className="font-display text-h2 text-foreground lg:hidden">Courses</h1>

      <div className="mt-4 lg:mt-0">
        <SearchInput value={search} onChange={setSearch} placeholder="Trajet, passager ou chauffeur..." className="lg:max-w-xs" />
      </div>

      <FilterChips options={FILTERS} value={filter} onChange={setFilter} label="Filtrer par statut" className="mt-4" />

      <p className="mt-3 text-body-sm text-muted-foreground">
        {filtered.length} course{filtered.length > 1 ? 's' : ''}
      </p>

      <RideTable rides={filtered} drivers={drivers} onView={(ride) => navigate(`/admin/rides/${ride.id}`)} className="mt-4" />
    </div>
  );
}
