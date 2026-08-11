import React, { useMemo, useState } from 'react';
import { FileText, ShieldBan, ShieldCheck } from 'lucide-react';
import { Avatar, Badge, Rating, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '@/components/ui';
import { useAdminStore } from '@/features/admin/adminStore';
import { VEHICLE_COLORS } from '@/data/vehicleColors';
import { formatFare } from '@/utils/format';
import type { Driver } from '@/types';

type FilterId = 'ALL' | 'ONLINE' | 'OFFLINE' | 'PENDING' | 'VERIFIED' | 'SUSPENDED';

const FILTERS: { id: FilterId; label: string }[] = [
  { id: 'ALL', label: 'Tous' },
  { id: 'ONLINE', label: 'En ligne' },
  { id: 'OFFLINE', label: 'Hors ligne' },
  { id: 'PENDING', label: 'En attente' },
  { id: 'VERIFIED', label: 'Vérifiés' },
  { id: 'SUSPENDED', label: 'Suspendus' },
];

function matchesFilter(driver: Driver, filter: FilterId): boolean {
  switch (filter) {
    case 'ALL':
      return true;
    case 'ONLINE':
    case 'OFFLINE':
      return driver.status === filter;
    default:
      return driver.verification === filter;
  }
}

const VERIFICATION_BADGE: Record<Driver['verification'], { label: string; variant: 'success' | 'warning' | 'danger' }> = {
  VERIFIED: { label: 'Vérifié', variant: 'success' },
  PENDING: { label: 'En attente', variant: 'warning' },
  SUSPENDED: { label: 'Suspendu', variant: 'danger' },
};

export default function AdminDriversPage() {
  const drivers = useAdminStore((s) => s.drivers);
  const setDriverVerification = useAdminStore((s) => s.setDriverVerification);
  const [filter, setFilter] = useState<FilterId>('ALL');

  const filtered = useMemo(() => drivers.filter((d) => matchesFilter(d, filter)), [drivers, filter]);

  return (
    <div className="mx-auto max-w-6xl px-5 pb-10 pt-8 lg:px-8">
      <h1 className="font-display text-h2 text-foreground lg:hidden">Chauffeurs</h1>

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
            <TableHeaderCell>Chauffeur</TableHeaderCell>
            <TableHeaderCell>Véhicule</TableHeaderCell>
            <TableHeaderCell>Note</TableHeaderCell>
            <TableHeaderCell>Statut</TableHeaderCell>
            <TableHeaderCell>Courses</TableHeaderCell>
            <TableHeaderCell>Gains</TableHeaderCell>
            <TableHeaderCell>Documents</TableHeaderCell>
            <TableHeaderCell>Actions</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filtered.map((driver) => {
            const verification = VERIFICATION_BADGE[driver.verification];
            const color = VEHICLE_COLORS[driver.vehicle.color];
            return (
              <TableRow key={driver.id}>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <Avatar name={driver.name} src={driver.avatar} size="sm" status={driver.status === 'ONLINE' ? 'online' : 'offline'} />
                    <span className="font-medium">{driver.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full border border-border" style={{ backgroundColor: color.hex }} />
                    {driver.vehicle.brand} {driver.vehicle.model}
                  </span>
                </TableCell>
                <TableCell>
                  <Rating value={driver.rating} showValue size={12} />
                </TableCell>
                <TableCell>
                  <Badge variant={verification.variant}>{verification.label}</Badge>
                </TableCell>
                <TableCell>{driver.tripsCompleted}</TableCell>
                <TableCell className="font-semibold">{formatFare(driver.earningsToday)}</TableCell>
                <TableCell className="text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5" /> {driver.documents.length}/4
                  </span>
                </TableCell>
                <TableCell>
                  {driver.verification === 'SUSPENDED' ? (
                    <button
                      onClick={() => setDriverVerification(driver.id, 'VERIFIED')}
                      className="flex items-center gap-1.5 text-xs font-semibold text-secondary-700 hover:underline"
                    >
                      <ShieldCheck className="h-3.5 w-3.5" /> Réactiver
                    </button>
                  ) : (
                    <button
                      onClick={() => setDriverVerification(driver.id, driver.verification === 'PENDING' ? 'VERIFIED' : 'SUSPENDED')}
                      className={`flex items-center gap-1.5 text-xs font-semibold hover:underline ${
                        driver.verification === 'PENDING' ? 'text-secondary-700' : 'text-danger'
                      }`}
                    >
                      {driver.verification === 'PENDING' ? (
                        <>
                          <ShieldCheck className="h-3.5 w-3.5" /> Vérifier
                        </>
                      ) : (
                        <>
                          <ShieldBan className="h-3.5 w-3.5" /> Suspendre
                        </>
                      )}
                    </button>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
