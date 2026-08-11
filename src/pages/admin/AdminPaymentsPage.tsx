import React, { useMemo, useState } from 'react';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { Badge, StatCard, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '@/components/ui';
import { MOCK_PLATFORM_PAYMENTS } from '@/data/mockPlatformPayments';
import { MOCK_PLATFORM_USERS } from '@/data/mockUsers';
import { formatFare, formatRelativeTime } from '@/utils/format';
import type { PaymentMethod, PaymentStatus } from '@/types';

type FilterId = 'ALL' | PaymentStatus;

const FILTERS: { id: FilterId; label: string }[] = [
  { id: 'ALL', label: 'Toutes' },
  { id: 'SUCCESS', label: 'Réussies' },
  { id: 'PENDING', label: 'En attente' },
  { id: 'FAILED', label: 'Échouées' },
];

const STATUS_BADGE: Record<PaymentStatus, { label: string; variant: 'success' | 'warning' | 'danger' }> = {
  SUCCESS: { label: 'Réussie', variant: 'success' },
  PENDING: { label: 'En attente', variant: 'warning' },
  FAILED: { label: 'Échouée', variant: 'danger' },
};

const METHOD_LABEL: Record<PaymentMethod, string> = {
  ESPECE: 'Espèces',
  ORANGE_MONEY: 'Orange Money',
  MOMO: 'MoMo',
  PAYCARD: 'PayCard',
  VISA: 'Carte',
  KULU: 'Kulu',
};

function userNameFor(id: string): string {
  return MOCK_PLATFORM_USERS.find((u) => u.id === id)?.name ?? id;
}

export default function AdminPaymentsPage() {
  const [filter, setFilter] = useState<FilterId>('ALL');

  const filtered = useMemo(
    () => (filter === 'ALL' ? MOCK_PLATFORM_PAYMENTS : MOCK_PLATFORM_PAYMENTS.filter((t) => t.status === filter)),
    [filter]
  );

  const volume = useMemo(
    () => MOCK_PLATFORM_PAYMENTS.filter((t) => t.status === 'SUCCESS').reduce((sum, t) => sum + t.amount, 0),
    []
  );
  const pendingCount = useMemo(() => MOCK_PLATFORM_PAYMENTS.filter((t) => t.status === 'PENDING').length, []);
  const failedCount = useMemo(() => MOCK_PLATFORM_PAYMENTS.filter((t) => t.status === 'FAILED').length, []);

  return (
    <div className="mx-auto max-w-6xl px-5 pb-10 pt-8 lg:px-8">
      <h1 className="font-display text-h2 text-foreground lg:hidden">Paiements</h1>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <StatCard label="Volume réussi" value={formatFare(volume)} />
        <StatCard label="En attente" value={String(pendingCount)} />
        <StatCard label="Échouées" value={String(failedCount)} />
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
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
            <TableHeaderCell>Utilisateur</TableHeaderCell>
            <TableHeaderCell>Description</TableHeaderCell>
            <TableHeaderCell>Méthode</TableHeaderCell>
            <TableHeaderCell>Montant</TableHeaderCell>
            <TableHeaderCell>Statut</TableHeaderCell>
            <TableHeaderCell>Quand</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filtered.map((txn) => {
            const status = STATUS_BADGE[txn.status];
            const isCredit = txn.type === 'CREDIT';
            return (
              <TableRow key={txn.id}>
                <TableCell className="font-medium">{userNameFor(txn.userId)}</TableCell>
                <TableCell className="text-muted-foreground">{txn.description}</TableCell>
                <TableCell className="text-muted-foreground">{METHOD_LABEL[txn.method]}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center gap-1.5 font-semibold ${isCredit ? 'text-secondary-700' : 'text-foreground'}`}>
                    {isCredit ? <ArrowDownLeft className="h-3.5 w-3.5" /> : <ArrowUpRight className="h-3.5 w-3.5" />}
                    {formatFare(txn.amount)}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{formatRelativeTime(txn.date)}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
