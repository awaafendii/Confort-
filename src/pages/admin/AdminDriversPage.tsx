import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ConfirmDialog, FilterChips, SearchInput } from '@/components/ui';
import { DriverTable } from '@/components/admin';
import { useAdminStore } from '@/features/admin/adminStore';
import type { Driver, DriverVerificationStatus } from '@/types';

type ConnectionFilter = 'ALL' | 'ONLINE' | 'OFFLINE';
type VerificationFilter = 'ALL' | DriverVerificationStatus;

const CONNECTION_FILTERS: { id: ConnectionFilter; label: string }[] = [
  { id: 'ALL', label: 'Tous' },
  { id: 'ONLINE', label: 'En ligne' },
  { id: 'OFFLINE', label: 'Hors ligne' },
];

const VERIFICATION_FILTERS: { id: VerificationFilter; label: string }[] = [
  { id: 'ALL', label: 'Tous' },
  { id: 'PENDING', label: 'En attente' },
  { id: 'VERIFIED', label: 'Vérifiés' },
  { id: 'SUSPENDED', label: 'Suspendus' },
];

const ACTION_LABEL: Record<DriverVerificationStatus, { title: string; description: (name: string) => string; confirm: string; destructive: boolean }> = {
  VERIFIED: {
    title: 'Vérifier ce chauffeur ?',
    description: (name) => `${name} pourra recevoir des courses en tant que chauffeur vérifié.`,
    confirm: 'Vérifier',
    destructive: false,
  },
  SUSPENDED: {
    title: 'Suspendre ce chauffeur ?',
    description: (name) => `${name} ne pourra plus recevoir de nouvelles courses tant que le compte reste suspendu.`,
    confirm: 'Suspendre',
    destructive: true,
  },
  PENDING: {
    title: 'Repasser en attente ?',
    description: (name) => `${name} repassera en vérification en attente.`,
    confirm: 'Confirmer',
    destructive: false,
  },
};

export default function AdminDriversPage() {
  const navigate = useNavigate();
  const drivers = useAdminStore((s) => s.drivers);
  const setDriverVerification = useAdminStore((s) => s.setDriverVerification);

  const [search, setSearch] = useState('');
  const [connectionFilter, setConnectionFilter] = useState<ConnectionFilter>('ALL');
  const [verificationFilter, setVerificationFilter] = useState<VerificationFilter>('ALL');
  const [pending, setPending] = useState<{ driver: Driver; next: DriverVerificationStatus } | null>(null);

  const filtered = useMemo(() => {
    const byConnection = connectionFilter === 'ALL' ? drivers : drivers.filter((d) => d.status === connectionFilter);
    const byVerification = verificationFilter === 'ALL' ? byConnection : byConnection.filter((d) => d.verification === verificationFilter);
    const query = search.trim().toLowerCase();
    if (!query) return byVerification;
    return byVerification.filter(
      (d) => d.name.toLowerCase().includes(query) || d.phone.includes(query) || d.vehicle.plateNumber.toLowerCase().includes(query)
    );
  }, [drivers, connectionFilter, verificationFilter, search]);

  const confirmAction = () => {
    if (!pending) return;
    setDriverVerification(pending.driver.id, pending.next);
    setPending(null);
  };

  return (
    <div className="mx-auto max-w-6xl px-5 pb-10 pt-8 lg:px-8">
      <h1 className="font-display text-h2 text-foreground lg:hidden">Chauffeurs</h1>

      <div className="mt-4 lg:mt-0">
        <SearchInput value={search} onChange={setSearch} placeholder="Nom, téléphone ou plaque..." className="lg:max-w-xs" />
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:gap-6">
        <div>
          <p className="mb-1.5 text-caption font-medium text-muted-foreground">Connexion</p>
          <FilterChips options={CONNECTION_FILTERS} value={connectionFilter} onChange={setConnectionFilter} label="Filtrer par connexion" />
        </div>
        <div>
          <p className="mb-1.5 text-caption font-medium text-muted-foreground">Vérification</p>
          <FilterChips options={VERIFICATION_FILTERS} value={verificationFilter} onChange={setVerificationFilter} label="Filtrer par vérification" />
        </div>
      </div>

      <p className="mt-3 text-body-sm text-muted-foreground">
        {filtered.length} chauffeur{filtered.length > 1 ? 's' : ''}
      </p>

      <DriverTable
        drivers={filtered}
        onView={(driver) => navigate(`/admin/drivers/${driver.id}`)}
        onRequestVerification={(driver, next) => setPending({ driver, next })}
        className="mt-4"
      />

      {pending && (
        <ConfirmDialog
          open={!!pending}
          onClose={() => setPending(null)}
          onConfirm={confirmAction}
          title={ACTION_LABEL[pending.next].title}
          description={ACTION_LABEL[pending.next].description(pending.driver.name)}
          confirmLabel={ACTION_LABEL[pending.next].confirm}
          destructive={ACTION_LABEL[pending.next].destructive}
        />
      )}
    </div>
  );
}
