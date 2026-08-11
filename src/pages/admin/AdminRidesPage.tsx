import React, { useMemo, useState } from 'react';
import { Badge, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '@/components/ui';
import { MOCK_PLATFORM_USERS } from '@/data/mockUsers';
import { MOCK_DRIVERS_POOL } from '@/data/mockDrivers';
import { useAdminStore } from '@/features/admin/adminStore';
import { MOCK_PLATFORM_RIDES } from '@/data/mockPlatformRides';
import { formatFare, formatRelativeTime } from '@/utils/format';
import type { RideStatus } from '@/types';

type FilterId = 'ALL' | RideStatus;

const FILTERS: { id: FilterId; label: string }[] = [
  { id: 'ALL', label: 'Toutes' },
  { id: 'COMPLETED', label: 'Terminées' },
  { id: 'IN_PROGRESS', label: 'En cours' },
  { id: 'CANCELLED', label: 'Annulées' },
];

const STATUS_BADGE: Record<RideStatus, { label: string; variant: 'success' | 'danger' | 'neutral' }> = {
  COMPLETED: { label: 'Terminée', variant: 'success' },
  CANCELLED: { label: 'Annulée', variant: 'danger' },
  IN_PROGRESS: { label: 'En cours', variant: 'neutral' },
  REQUESTED: { label: 'Demandée', variant: 'neutral' },
  SEARCHING_DRIVER: { label: 'Recherche', variant: 'neutral' },
  DRIVER_ASSIGNED: { label: 'Assignée', variant: 'neutral' },
  DRIVER_ARRIVING: { label: 'En approche', variant: 'neutral' },
  DRIVER_ARRIVED: { label: 'Chauffeur arrivé', variant: 'neutral' },
};

/** Le store admin dédoublonne 'md-1' (même identité que le chauffeur démo) ; on retombe sur le pool complet pour résoudre son nom dans l'historique. */
function nameFor(id: string, drivers: { id: string; name: string }[]): string {
  return (
    MOCK_PLATFORM_USERS.find((u) => u.id === id)?.name ??
    drivers.find((d) => d.id === id)?.name ??
    MOCK_DRIVERS_POOL.find((d) => d.id === id)?.name ??
    id
  );
}

export default function AdminRidesPage() {
  const drivers = useAdminStore((s) => s.drivers);
  const [filter, setFilter] = useState<FilterId>('ALL');

  const filtered = useMemo(
    () => (filter === 'ALL' ? MOCK_PLATFORM_RIDES : MOCK_PLATFORM_RIDES.filter((r) => r.status === filter)),
    [filter]
  );

  return (
    <div className="mx-auto max-w-6xl px-5 pb-10 pt-8 lg:px-8">
      <h1 className="font-display text-h2 text-foreground lg:hidden">Courses</h1>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:mt-0">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
              filter === f.id ? 'border-primary-700 bg-primary-50 text-primary-800' : 'border-border text-muted-foreground'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <Table className="mt-4">
        <TableHead>
          <TableRow>
            <TableHeaderCell>Trajet</TableHeaderCell>
            <TableHeaderCell>Passager</TableHeaderCell>
            <TableHeaderCell>Chauffeur</TableHeaderCell>
            <TableHeaderCell>Catégorie</TableHeaderCell>
            <TableHeaderCell>Montant</TableHeaderCell>
            <TableHeaderCell>Statut</TableHeaderCell>
            <TableHeaderCell>Quand</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filtered.map((ride) => {
            const status = STATUS_BADGE[ride.status];
            return (
              <TableRow key={ride.id}>
                <TableCell>
                  {ride.pickup.label} → {ride.destination.label}
                </TableCell>
                <TableCell className="text-muted-foreground">{nameFor(ride.passengerId, drivers)}</TableCell>
                <TableCell className="text-muted-foreground">{ride.driverId ? nameFor(ride.driverId, drivers) : '—'}</TableCell>
                <TableCell className="text-muted-foreground">{ride.category}</TableCell>
                <TableCell className="font-semibold">{formatFare(ride.fare)}</TableCell>
                <TableCell>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{formatRelativeTime(ride.requestedAt)}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
