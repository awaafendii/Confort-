import React, { useMemo, useState } from 'react';
import { Ban, Banknote, Download, TrendingUp, Undo2, Wallet } from 'lucide-react';
import { Button, Card, FilterChips, Modal, SearchInput, SegmentedControl, StatCard, Textarea, toast } from '@/components/ui';
import { METHOD_LABEL, PaymentTable } from '@/components/admin';
import { useAdminStore } from '@/features/admin/adminStore';
import { usePayoutRequestsStore } from '@/features/payments/payoutRequestsStore';
import { formatFare } from '@/utils/format';
import type { PaymentMethod, PaymentStatus, Transaction } from '@/types';

/**
 * Estimation d'affichage — même principe et même taux que DriverEarningsPage (§6.5) : aucune
 * vraie configuration de commission n'existe encore (reviendrait à AdminSettingsPage/Tarification).
 */
const COMMISSION_RATE = 0.15;

type Period = 'today' | '7d' | '30d';
type StatusFilter = 'ALL' | PaymentStatus;
type MethodFilter = 'ALL' | PaymentMethod;

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: 'today', label: "Aujourd'hui" },
  { value: '7d', label: '7 jours' },
  { value: '30d', label: '30 jours' },
];

const STATUS_FILTERS: { id: StatusFilter; label: string }[] = [
  { id: 'ALL', label: 'Toutes' },
  { id: 'SUCCESS', label: 'Réussies' },
  { id: 'PENDING', label: 'En attente' },
  { id: 'FAILED', label: 'Échouées' },
];

const METHOD_FILTERS: { id: MethodFilter; label: string }[] = [
  { id: 'ALL', label: 'Toutes' },
  ...(Object.keys(METHOD_LABEL) as PaymentMethod[]).map((id) => ({ id, label: METHOD_LABEL[id] })),
];

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function periodCutoff(period: Period): Date {
  const days = period === 'today' ? 1 : period === '7d' ? 7 : 30;
  const cutoff = startOfDay(new Date());
  cutoff.setDate(cutoff.getDate() - days + 1);
  return cutoff;
}

function exportCsv(transactions: Transaction[]) {
  const header = ['Utilisateur', 'Description', 'Méthode', 'Montant', 'Statut', 'Date'];
  const rows = transactions.map((t) => [t.userId, t.description, METHOD_LABEL[t.method], String(t.amount), t.status, t.date]);
  const csv = [header, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `confort-plus-paiements-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminPaymentsPage() {
  const payments = useAdminStore((s) => s.payments);
  const refundTransaction = useAdminStore((s) => s.refundTransaction);
  const payoutRequests = usePayoutRequestsStore((s) => s.requests);

  const [period, setPeriod] = useState<Period>('30d');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [methodFilter, setMethodFilter] = useState<MethodFilter>('ALL');
  const [search, setSearch] = useState('');
  const [refundTarget, setRefundTarget] = useState<Transaction | null>(null);
  const [refundReason, setRefundReason] = useState('');

  const refundedRideIds = useMemo(
    () => new Set(payments.filter((t) => t.description.startsWith('Remboursement')).map((t) => t.rideId).filter((id): id is string => !!id)),
    [payments]
  );

  const periodPayments = useMemo(() => {
    const cutoff = periodCutoff(period);
    return payments.filter((t) => new Date(t.date) >= cutoff);
  }, [payments, period]);

  const filtered = useMemo(() => {
    const byStatus = statusFilter === 'ALL' ? periodPayments : periodPayments.filter((t) => t.status === statusFilter);
    const byMethod = methodFilter === 'ALL' ? byStatus : byStatus.filter((t) => t.method === methodFilter);
    const query = search.trim().toLowerCase();
    if (!query) return byMethod;
    return byMethod.filter((t) => t.description.toLowerCase().includes(query) || t.userId.toLowerCase().includes(query));
  }, [periodPayments, statusFilter, methodFilter, search]);

  const revenue = useMemo(() => periodPayments.filter((t) => t.type === 'DEBIT' && t.status === 'SUCCESS').reduce((s, t) => s + t.amount, 0), [periodPayments]);
  const commission = Math.round(revenue * COMMISSION_RATE);
  const failedCount = useMemo(() => periodPayments.filter((t) => t.status === 'FAILED').length, [periodPayments]);
  const refunds = useMemo(() => periodPayments.filter((t) => t.description.startsWith('Remboursement')), [periodPayments]);
  const refundsTotal = refunds.reduce((s, t) => s + t.amount, 0);

  const submitRefund = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundTarget || !refundReason.trim()) return;
    refundTransaction(refundTarget.id, refundReason.trim());
    toast.success('Remboursement enregistré.');
    setRefundTarget(null);
    setRefundReason('');
  };

  return (
    <div className="mx-auto max-w-6xl px-5 pb-10 pt-8 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-h2 text-foreground lg:hidden">Paiements</h1>
        <SegmentedControl label="Période" value={period} onChange={setPeriod} options={PERIOD_OPTIONS} className="ml-auto lg:ml-0" />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Revenus" value={formatFare(revenue)} icon={<TrendingUp className="h-5 w-5" />} />
        <StatCard label="Commission (15 %)" value={formatFare(commission)} icon={<Banknote className="h-5 w-5" />} />
        <StatCard label="Paiements échoués" value={String(failedCount)} icon={<Ban className="h-5 w-5" />} />
        <StatCard label="Remboursements" value={formatFare(refundsTotal)} icon={<Undo2 className="h-5 w-5" />} />
      </div>

      {payoutRequests.length > 0 && (
        <Card className="mt-5">
          <p className="mb-3 flex items-center gap-2 text-body-sm font-semibold text-foreground">
            <Wallet className="h-4 w-4" /> Retraits chauffeurs (Mobile Money) en attente
          </p>
          <div className="space-y-2">
            {payoutRequests.map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-lg border border-border px-3.5 py-2.5 text-body-sm">
                <span className="text-foreground">{r.destinationLabel}</span>
                <span className="font-semibold text-foreground">{formatFare(r.amount)}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:gap-6">
          <SearchInput value={search} onChange={setSearch} placeholder="Utilisateur ou description..." className="sm:max-w-xs" />
          <div>
            <p className="mb-1.5 text-caption font-medium text-muted-foreground">Statut</p>
            <FilterChips options={STATUS_FILTERS} value={statusFilter} onChange={setStatusFilter} label="Filtrer par statut" />
          </div>
          <div>
            <p className="mb-1.5 text-caption font-medium text-muted-foreground">Méthode</p>
            <FilterChips options={METHOD_FILTERS} value={methodFilter} onChange={setMethodFilter} label="Filtrer par méthode" />
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => exportCsv(filtered)} disabled={filtered.length === 0}>
          <Download className="h-4 w-4" /> Exporter (CSV)
        </Button>
      </div>

      <p className="mt-3 text-body-sm text-muted-foreground">
        {filtered.length} transaction{filtered.length > 1 ? 's' : ''}
      </p>

      <PaymentTable transactions={filtered} refundedRideIds={refundedRideIds} onRefund={setRefundTarget} className="mt-4" />

      <Modal open={!!refundTarget} onClose={() => setRefundTarget(null)} title="Rembourser cette transaction">
        {refundTarget && (
          <form onSubmit={submitRefund} className="space-y-4">
            <p className="text-body-sm text-muted-foreground">
              {refundTarget.description} — <span className="font-semibold text-foreground">{formatFare(refundTarget.amount)}</span>
            </p>
            <Textarea
              label="Motif du remboursement"
              placeholder="Décrivez la raison du remboursement..."
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              required
            />
            <Button type="submit" variant="danger" className="w-full" disabled={!refundReason.trim()}>
              Confirmer le remboursement
            </Button>
          </form>
        )}
      </Modal>
    </div>
  );
}
