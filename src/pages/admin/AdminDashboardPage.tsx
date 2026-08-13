import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AlertTriangle, Ban, Car, CheckCircle2, DollarSign, ShieldAlert, Star, TrendingUp, Users } from 'lucide-react';
import { Badge, Button, Card, EmptyState, SegmentedControl, StatCard, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '@/components/ui';
import { RIDE_STATUS_CONFIG } from '@/components/admin';
import { computePlatformKpis, computePeriodStats, buildActivitySeries } from '@/data/platformKpis';
import { MOCK_PLATFORM_RIDES } from '@/data/mockPlatformRides';
import { useAdminStore } from '@/features/admin/adminStore';
import { formatFare, formatRelativeTime } from '@/utils/format';

/** Résolution du nom d'auteur pour l'affichage — même principe que AdminAuditPage.tsx (dupliqué plutôt qu'importé, cf. DEMO_DRIVER_ENTRY dans adminStore.ts). */
const ACTOR_NAME: Record<string, string> = {
  'demo-admin': 'Admin Confort+',
  'demo-super-admin': 'Founé Camara',
};

type Period = 'today' | '7d' | '30d';
type ChartMetric = 'trips' | 'revenue';

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: 'today', label: "Aujourd'hui" },
  { value: '7d', label: '7 jours' },
  { value: '30d', label: '30 jours' },
];

/** Seuil au-delà duquel un taux d'annulation est signalé en alerte — repère opérationnel courant pour le VTC, pas une valeur de la plateforme. */
const HIGH_CANCELLATION_THRESHOLD = 0.1;

function formatCompactAmount(value: number): string {
  return value >= 1000 ? `${Math.round(value / 1000)}k` : String(value);
}

function ChartTooltip({ active, payload, label, metric }: { active?: boolean; payload?: { value: number }[]; label?: string; metric: ChartMetric }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-background px-3 py-2 text-xs shadow-elevated">
      <p className="font-semibold text-foreground">{label}</p>
      <p className="text-muted-foreground">
        <span className="font-semibold text-foreground">{metric === 'trips' ? payload[0].value : formatFare(payload[0].value)}</span>
        {metric === 'trips' ? ' courses' : ''}
      </p>
    </div>
  );
}

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const tickets = useAdminStore((s) => s.tickets);
  const users = useAdminStore((s) => s.users);
  const auditLog = useAdminStore((s) => s.auditLog);

  const [period, setPeriod] = useState<Period>('today');
  const [chartMetric, setChartMetric] = useState<ChartMetric>('trips');

  const kpis = computePlatformKpis();
  const periodDays = period === 'today' ? 1 : period === '7d' ? 7 : 30;
  const chartDays = period === '30d' ? 30 : 7;

  const periodStats = useMemo(
    () =>
      period === 'today'
        ? { trips: kpis.tripsToday, revenue: kpis.revenueToday, cancellationRate: kpis.cancellationRate, averageRating: kpis.averageRating }
        : computePeriodStats(periodDays),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [period, periodDays]
  );
  const series = useMemo(() => buildActivitySeries(chartDays), [chartDays]);
  const recentRides = MOCK_PLATFORM_RIDES.slice(0, 5);

  const openTickets = tickets.filter((t) => t.status === 'NEW' || t.status === 'IN_PROGRESS' || t.status === 'WAITING').length;
  const flaggedUsers = users.filter((u) => u.status === 'SUSPENDED' || u.status === 'BLOCKED').length;
  const highCancellation = periodStats.cancellationRate > HIGH_CANCELLATION_THRESHOLD;

  interface Alert {
    icon: React.ReactNode;
    tone: 'danger' | 'warning';
    message: string;
    onClick: () => void;
  }

  const alerts: Alert[] = [];
  if (highCancellation) {
    alerts.push({
      icon: <AlertTriangle className="h-4 w-4" />,
      tone: 'danger',
      message: `Taux d'annulation élevé : ${Math.round(periodStats.cancellationRate * 100)}%`,
      onClick: () => navigate('/admin/rides'),
    });
  }
  if (openTickets > 0) {
    alerts.push({
      icon: <ShieldAlert className="h-4 w-4" />,
      tone: 'warning',
      message: `${openTickets} ticket${openTickets > 1 ? 's' : ''} support en attente`,
      onClick: () => navigate('/admin/support'),
    });
  }
  if (flaggedUsers > 0) {
    alerts.push({
      icon: <Ban className="h-4 w-4" />,
      tone: 'warning',
      message: `${flaggedUsers} compte${flaggedUsers > 1 ? 's' : ''} suspendu${flaggedUsers > 1 ? 's' : ''} ou bloqué${flaggedUsers > 1 ? 's' : ''}`,
      onClick: () => navigate('/admin/users'),
    });
  }

  const periodLabel = period === 'today' ? "Aujourd'hui" : period === '7d' ? '7 jours' : '30 jours';

  return (
    <div className="mx-auto max-w-6xl px-5 pb-10 pt-8 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-h2 text-foreground lg:hidden">Dashboard</h1>
        <SegmentedControl label="Période" value={period} onChange={setPeriod} options={PERIOD_OPTIONS} className="ml-auto lg:ml-0" />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatCard label="Utilisateurs" value={String(kpis.totalUsers)} icon={<Users className="h-5 w-5" />} />
        <StatCard label="Passagers actifs" value={String(kpis.activePassengers)} icon={<Users className="h-5 w-5" />} />
        <StatCard label="Chauffeurs actifs" value={String(kpis.activeDrivers)} icon={<Car className="h-5 w-5" />} />
        <StatCard label={`Courses · ${periodLabel}`} value={String(periodStats.trips)} icon={<TrendingUp className="h-5 w-5" />} />
        <StatCard label={`Revenu · ${periodLabel}`} value={formatFare(periodStats.revenue)} icon={<DollarSign className="h-5 w-5" />} />
        <StatCard label={`Annulation · ${periodLabel}`} value={`${Math.round(periodStats.cancellationRate * 100)}%`} icon={<Ban className="h-5 w-5" />} />
        <StatCard label="Note moyenne" value={periodStats.averageRating > 0 ? periodStats.averageRating.toFixed(1) : '—'} icon={<Star className="h-5 w-5" />} />
      </div>

      <Card className="mt-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold text-foreground">Activité des {chartDays} derniers jours</p>
          <SegmentedControl
            value={chartMetric}
            onChange={setChartMetric}
            options={[
              { value: 'trips', label: 'Courses' },
              { value: 'revenue', label: 'Revenus' },
            ]}
          />
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={series} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barCategoryGap={chartDays === 30 ? '15%' : '30%'}>
              <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                interval={chartDays === 30 ? 4 : 0}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                width={chartMetric === 'revenue' ? 48 : 40}
                tickFormatter={chartMetric === 'revenue' ? formatCompactAmount : undefined}
              />
              <Tooltip cursor={{ fill: 'hsl(var(--surface-hover))' }} content={<ChartTooltip metric={chartMetric} />} />
              <Bar dataKey={chartMetric} fill="hsl(var(--accent-600))" radius={[4, 4, 0, 0]} maxBarSize={chartDays === 30 ? 10 : 28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div>
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">Courses récentes</p>
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin/rides')}>
              Voir tout
            </Button>
          </div>
          <Table className="mt-3">
            <TableHead>
              <TableRow>
                <TableHeaderCell>Trajet</TableHeaderCell>
                <TableHeaderCell>Catégorie</TableHeaderCell>
                <TableHeaderCell>Montant</TableHeaderCell>
                <TableHeaderCell>Statut</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentRides.map((ride) => {
                const status = RIDE_STATUS_CONFIG[ride.status];
                return (
                  <TableRow key={ride.id}>
                    <TableCell>
                      {ride.pickup.label} → {ride.destination.label}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{ride.category}</TableCell>
                    <TableCell className="font-semibold">{formatFare(ride.fare)}</TableCell>
                    <TableCell>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        <div>
          <p className="text-sm font-semibold text-foreground">Alertes</p>
          {alerts.length > 0 ? (
            <div className="mt-3 space-y-2.5">
              {alerts.map((alert, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={alert.onClick}
                  className="flex w-full items-center gap-3 rounded-xl border border-border bg-background p-3.5 text-left transition-colors hover:bg-surface-hover"
                >
                  <div
                    className={
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ' +
                      (alert.tone === 'danger' ? 'bg-danger/10 text-danger' : 'bg-warning/10 text-warning-strong')
                    }
                  >
                    {alert.icon}
                  </div>
                  <p className="text-body-sm font-medium text-foreground">{alert.message}</p>
                </button>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<CheckCircle2 className="h-6 w-6" />}
              title="Aucune anomalie détectée"
              description="Taux d'annulation, tickets et comptes signalés sont dans les normes."
              className="mt-3"
            />
          )}
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">Activité système</p>
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin/audit')}>
            Voir tout
          </Button>
        </div>
        <div className="mt-3 space-y-2">
          {auditLog.slice(0, 5).map((entry) => (
            <div key={entry.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-4 py-3">
              <p className="text-body-sm text-foreground">
                <span className="font-semibold">{ACTOR_NAME[entry.actorId] ?? entry.actorId}</span> · {entry.action} · {entry.target}
              </p>
              <span className="shrink-0 text-caption text-muted-foreground">{formatRelativeTime(entry.createdAt)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
