import React, { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Banknote, Calendar, Car, Clock, Info, Wallet } from 'lucide-react';
import { Badge, Button, Card, Input, Modal, SegmentedControl, Skeleton, StatCard, toast } from '@/components/ui';
import { PriceBreakdown } from '@/components/business';
import { useAuthStore } from '@/features/auth/store';
import { useDriverSessionStore } from '@/features/drivers/driverSessionStore';
import { usePayoutRequestsStore } from '@/features/payments/payoutRequestsStore';
import { useDriverRideHistoryStore } from '@/features/rides/driverRideHistoryStore';
import { formatFare } from '@/utils/format';
import type { Driver, PaymentMethod, Ride } from '@/types';

/**
 * Estimation d'affichage uniquement — aucune vraie retenue n'est appliquée nulle part dans
 * l'app (les gains crédités restent le tarif plein). Une vraie configuration de commission
 * appartiendrait à AdminSettingsPage/Tarification, pas encore branchée (audit § "Tarification").
 */
const COMMISSION_RATE = 0.15;

type Period = 'week' | 'month';

const WITHDRAW_METHODS: { id: PaymentMethod; label: string }[] = [
  { id: 'ORANGE_MONEY', label: 'Orange Money' },
  { id: 'MOMO', label: 'MoMo' },
];

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function isSameDay(a: Date, b: Date): boolean {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

function buildDailySeries(days: number, earningsToday: number, rides: Ride[]) {
  const today = startOfDay(new Date());
  return Array.from({ length: days }, (_, i) => {
    const offset = days - 1 - i;
    const date = new Date(today);
    date.setDate(date.getDate() - offset);
    const total =
      offset === 0
        ? earningsToday
        : rides.filter((r) => isSameDay(new Date(r.requestedAt), date)).reduce((sum, r) => sum + r.fare, 0);
    return { date: date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }), total };
  });
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-background px-3 py-2 text-caption shadow-elevated">
      <p className="font-semibold text-foreground">{label}</p>
      <p className="font-semibold text-accent-700">{formatFare(payload[0].value)}</p>
    </div>
  );
}

function DriverEarningsSkeleton() {
  return (
    <div role="status" aria-label="Chargement" className="mx-auto max-w-md px-5 pb-10 pt-8 lg:max-w-2xl lg:px-8">
      <Skeleton className="h-7 w-24" />
      <div className="mt-6 grid grid-cols-2 gap-3">
        <Skeleton className="h-20 rounded-lg" />
        <Skeleton className="h-20 rounded-lg" />
        <Skeleton className="h-20 rounded-lg" />
        <Skeleton className="h-20 rounded-lg" />
      </div>
      <Skeleton className="mt-5 h-56 w-full rounded-lg" />
    </div>
  );
}

export default function DriverEarningsPage() {
  const account = useAuthStore((s) => s.account) as Driver | null;
  const tripsToday = useDriverSessionStore((s) => s.tripsToday);
  const driverRides = useDriverRideHistoryStore((s) => s.rides);
  const requests = usePayoutRequestsStore((s) => s.requests);
  const addRequest = usePayoutRequestsStore((s) => s.addRequest);

  const [period, setPeriod] = useState<Period>('week');
  const [modalOpen, setModalOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState<PaymentMethod>('ORANGE_MONEY');

  const series = useMemo(
    () => buildDailySeries(period === 'week' ? 7 : 30, account?.earningsToday ?? 0, driverRides),
    [period, account?.earningsToday, driverRides]
  );

  if (!account) return <DriverEarningsSkeleton />;

  const today = startOfDay(new Date());
  const periodDays = period === 'week' ? 7 : 30;
  const cutoff = new Date(today);
  cutoff.setDate(cutoff.getDate() - periodDays + 1);
  const periodHistoricalRides = driverRides.filter((r) => {
    const d = new Date(r.requestedAt);
    return !isSameDay(d, today) && d >= cutoff;
  });
  const periodTotal = periodHistoricalRides.reduce((sum, r) => sum + r.fare, 0) + account.earningsToday;
  const periodTripCount = periodHistoricalRides.length + tripsToday;
  const periodAverage = periodTotal / Math.max(1, periodTripCount);

  const maxAmount = account.earningsToday;
  const commissionToday = Math.round(account.earningsToday * COMMISSION_RATE);
  const netToday = account.earningsToday - commissionToday;

  const submitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const value = Math.min(Number(amount) || 0, maxAmount);
    if (value <= 0) return;
    const methodLabel = WITHDRAW_METHODS.find((m) => m.id === withdrawMethod)!.label;
    addRequest({ amount: value, method: withdrawMethod, destinationLabel: `${methodLabel} · ${account.phone}` });
    toast.success('Demande de retrait envoyée — traitement sous 24 à 48 h.');
    setAmount('');
    setModalOpen(false);
  };

  return (
    <div className="mx-auto max-w-md px-5 pb-10 pt-8 lg:max-w-2xl lg:px-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-h2 text-foreground lg:hidden">Mes gains</h1>
        <SegmentedControl
          label="Période"
          value={period}
          onChange={setPeriod}
          options={[
            { value: 'week', label: 'Semaine' },
            { value: 'month', label: 'Mois' },
          ]}
          className="ml-auto lg:ml-0"
        />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <StatCard label="Aujourd'hui" value={formatFare(account.earningsToday)} icon={<Wallet className="h-5 w-5" />} />
        <StatCard label={period === 'week' ? 'Cette semaine' : 'Ce mois'} value={formatFare(periodTotal)} icon={<Calendar className="h-5 w-5" />} />
        <StatCard label={period === 'week' ? 'Courses (semaine)' : 'Courses (mois)'} value={String(periodTripCount)} icon={<Car className="h-5 w-5" />} />
        <StatCard label="Gain moyen / course" value={formatFare(periodAverage)} icon={<Banknote className="h-5 w-5" />} />
      </div>

      <Card className="mt-5">
        <p className="mb-4 text-body-sm font-semibold text-foreground">
          Tendance des gains — {period === 'week' ? '7 derniers jours' : '30 derniers jours'}
        </p>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={series} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barCategoryGap={period === 'week' ? '30%' : '15%'}>
              <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                interval={period === 'week' ? 0 : 4}
              />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} width={40} />
              <Tooltip cursor={{ fill: 'hsl(var(--surface-hover))' }} content={<ChartTooltip />} />
              <Bar dataKey="total" fill="hsl(var(--accent-600))" radius={[4, 4, 0, 0]} maxBarSize={period === 'week' ? 28 : 10} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="mt-5">
        <p className="mb-1 text-body-sm font-semibold text-foreground">Répartition d'aujourd'hui</p>
        <p className="mb-3 text-caption text-muted-foreground">Estimation — aucune retenue n'est réellement appliquée dans cette démo.</p>
        <PriceBreakdown
          items={[
            { label: 'Revenus bruts', amount: account.earningsToday },
            { label: 'Commission Confort+ (15 %)', amount: -commissionToday },
          ]}
          total={netToday}
        />
      </Card>

      <Card className="mt-5 flex items-center gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary-50 text-secondary-800">
          <Wallet className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p className="text-body-sm font-semibold text-foreground">Retrait vers Mobile Money</p>
          <p className="text-caption text-muted-foreground">{WITHDRAW_METHODS.find((m) => m.id === withdrawMethod)!.label} · {account.phone}</p>
        </div>
      </Card>
      <Button variant="primary" size="lg" className="mt-4 w-full" onClick={() => setModalOpen(true)} disabled={maxAmount <= 0}>
        Retirer mes gains
      </Button>

      {requests.length > 0 && (
        <>
          <h2 className="mb-3 mt-8 text-body-sm font-semibold text-foreground">Demandes de retrait</h2>
          <div className="space-y-2">
            {requests.map((r) => (
              <Card key={r.id} noPadding className="flex items-center gap-3.5 px-4 py-3.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface text-muted-foreground">
                  <Clock className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-body-sm font-medium text-foreground">{formatFare(r.amount)}</p>
                  <p className="text-caption text-muted-foreground">{r.destinationLabel}</p>
                </div>
                <Badge variant="warning">En attente</Badge>
              </Card>
            ))}
          </div>
        </>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Retirer mes gains">
        <p className="mb-4 text-body-sm text-muted-foreground">
          Disponible : <span className="font-semibold text-foreground">{formatFare(maxAmount)}</span>
        </p>
        <form onSubmit={submitRequest} className="space-y-4">
          <Input
            label="Montant à retirer (FG)"
            type="number"
            min={1}
            max={maxAmount}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
          <div>
            <p className="mb-2 text-body-sm font-medium text-foreground">Vers</p>
            <SegmentedControl
              label="Moyen de retrait"
              value={withdrawMethod}
              onChange={setWithdrawMethod}
              options={WITHDRAW_METHODS.map((m) => ({ value: m.id, label: m.label }))}
              className="w-full"
            />
          </div>
          <div className="flex items-start gap-2.5 rounded-xl border border-dashed border-border p-3 text-caption text-muted-foreground">
            <Info className="h-4 w-4 shrink-0" />
            Aucun virement réel n'est effectué dans cette démo — la demande sera enregistrée en attente, sans
            intégration Mobile Money branchée.
          </div>
          <Button type="submit" variant="primary" size="lg" className="w-full">
            Envoyer la demande
          </Button>
        </form>
      </Modal>
    </div>
  );
}
