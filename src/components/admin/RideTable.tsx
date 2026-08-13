import React from 'react';
import { MOCK_PLATFORM_USERS } from '@/data/mockUsers';
import { MOCK_DRIVERS_POOL } from '@/data/mockDrivers';
import { formatFare, formatRelativeTime } from '@/utils/format';
import { AdminDataTable, type AdminDataTableColumn } from './AdminDataTable';
import { StatusBadge } from '@/components/ui';
import { RIDE_STATUS_CONFIG } from './rideStatus';
import type { Ride } from '@/types';

/** Le store admin dédoublonne 'md-1' (même identité que le chauffeur démo) ; on retombe sur le pool complet pour résoudre son nom dans l'historique. */
function nameFor(id: string, drivers: { id: string; name: string }[]): string {
  return (
    MOCK_PLATFORM_USERS.find((u) => u.id === id)?.name ??
    drivers.find((d) => d.id === id)?.name ??
    MOCK_DRIVERS_POOL.find((d) => d.id === id)?.name ??
    id
  );
}

export interface RideTableProps {
  rides: Ride[];
  drivers: { id: string; name: string }[];
  loading?: boolean;
  onView: (ride: Ride) => void;
  className?: string;
}

export const RideTable: React.FC<RideTableProps> = ({ rides, drivers, loading, onView, className }) => {
  const columns: AdminDataTableColumn<Ride>[] = [
    {
      key: 'trajet',
      header: 'Trajet',
      render: (r) => (
        <span>
          {r.pickup.label} → {r.destination.label}
        </span>
      ),
    },
    {
      key: 'passenger',
      header: 'Passager',
      sortValue: (r) => nameFor(r.passengerId, drivers),
      render: (r) => <span className="text-muted-foreground">{nameFor(r.passengerId, drivers)}</span>,
    },
    {
      key: 'driver',
      header: 'Chauffeur',
      sortValue: (r) => (r.driverId ? nameFor(r.driverId, drivers) : ''),
      render: (r) => <span className="text-muted-foreground">{r.driverId ? nameFor(r.driverId, drivers) : '—'}</span>,
    },
    { key: 'category', header: 'Catégorie', sortValue: (r) => r.category, render: (r) => <span className="text-muted-foreground">{r.category}</span> },
    { key: 'fare', header: 'Montant', sortValue: (r) => r.fare, render: (r) => <span className="font-semibold">{formatFare(r.fare)}</span> },
    {
      key: 'status',
      header: 'Statut',
      sortValue: (r) => r.status,
      render: (r) => <StatusBadge status={r.status} config={RIDE_STATUS_CONFIG} />,
    },
    {
      key: 'when',
      header: 'Quand',
      sortValue: (r) => r.requestedAt,
      render: (r) => <span className="text-muted-foreground">{formatRelativeTime(r.requestedAt)}</span>,
    },
  ];

  return (
    <AdminDataTable
      columns={columns}
      rows={rides}
      rowKey={(r) => r.id}
      loading={loading}
      emptyTitle="Aucune course"
      emptyDescription="Aucun résultat pour cette recherche ou ce filtre."
      onRowClick={onView}
      className={className}
    />
  );
};
