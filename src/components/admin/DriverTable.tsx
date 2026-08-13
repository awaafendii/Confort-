import React from 'react';
import { AlertTriangle, FileText, ShieldBan, ShieldCheck } from 'lucide-react';
import { Avatar, Rating } from '@/components/ui';
import { VEHICLE_COLORS } from '@/data/vehicleColors';
import { formatFare } from '@/utils/format';
import { AdminDataTable, type AdminDataTableColumn } from './AdminDataTable';
import { DriverStatusBadge } from './DriverStatusBadge';
import { summarizeDocuments } from './driverDocuments';
import type { Driver } from '@/types';

export interface DriverTableProps {
  drivers: Driver[];
  loading?: boolean;
  onView: (driver: Driver) => void;
  onRequestVerification: (driver: Driver, next: Driver['verification']) => void;
  className?: string;
}

export const DriverTable: React.FC<DriverTableProps> = ({ drivers, loading, onView, onRequestVerification, className }) => {
  const columns: AdminDataTableColumn<Driver>[] = [
    {
      key: 'name',
      header: 'Chauffeur',
      sortValue: (d) => d.name,
      render: (d) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={d.name} src={d.avatar} size="sm" status={d.status === 'ONLINE' ? 'online' : 'offline'} />
          <span className="font-medium">{d.name}</span>
        </div>
      ),
    },
    {
      key: 'vehicle',
      header: 'Véhicule',
      render: (d) => {
        const color = VEHICLE_COLORS[d.vehicle.color];
        return (
          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
            <span className="h-2.5 w-2.5 rounded-full border border-border" style={{ backgroundColor: color.hex }} />
            {d.vehicle.brand} {d.vehicle.model}
          </span>
        );
      },
    },
    { key: 'rating', header: 'Note', sortValue: (d) => d.rating, render: (d) => <Rating value={d.rating} showValue size={12} /> },
    {
      key: 'verification',
      header: 'Vérification',
      sortValue: (d) => d.verification,
      render: (d) => <DriverStatusBadge status={d.verification} />,
    },
    { key: 'trips', header: 'Courses', sortValue: (d) => d.tripsCompleted, render: (d) => d.tripsCompleted },
    { key: 'earnings', header: 'Gains', sortValue: (d) => d.earningsToday, render: (d) => <span className="font-semibold">{formatFare(d.earningsToday)}</span> },
    {
      key: 'documents',
      header: 'Documents',
      render: (d) => {
        const { validated, total, needsAttention } = summarizeDocuments(d.documents);
        return (
          <span className={`inline-flex items-center gap-1.5 ${needsAttention ? 'text-warning-strong' : 'text-muted-foreground'}`}>
            {needsAttention ? <AlertTriangle className="h-3.5 w-3.5" /> : <FileText className="h-3.5 w-3.5" />}
            {validated}/{total}
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (d) => (
        <div onClick={(e) => e.stopPropagation()}>
          {d.verification === 'SUSPENDED' ? (
            <button
              onClick={() => onRequestVerification(d, 'VERIFIED')}
              className="flex items-center gap-1.5 text-xs font-semibold text-secondary-700 hover:underline"
            >
              <ShieldCheck className="h-3.5 w-3.5" /> Réactiver
            </button>
          ) : (
            <button
              onClick={() => onRequestVerification(d, d.verification === 'PENDING' ? 'VERIFIED' : 'SUSPENDED')}
              className={`flex items-center gap-1.5 text-xs font-semibold hover:underline ${
                d.verification === 'PENDING' ? 'text-secondary-700' : 'text-danger'
              }`}
            >
              {d.verification === 'PENDING' ? (
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
        </div>
      ),
    },
  ];

  return (
    <AdminDataTable
      columns={columns}
      rows={drivers}
      rowKey={(d) => d.id}
      loading={loading}
      emptyTitle="Aucun chauffeur"
      emptyDescription="Aucun résultat pour cette recherche ou ces filtres."
      onRowClick={onView}
      className={className}
    />
  );
};
