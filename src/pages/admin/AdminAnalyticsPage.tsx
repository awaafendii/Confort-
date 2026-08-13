import React, { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Banknote, MapPin, TrendingUp, Trophy, Undo2 } from 'lucide-react';
import { Avatar, Card, FilterChips, Input, Rating, StatCard, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '@/components/ui';
import { useAdminStore } from '@/features/admin/adminStore';
import { buildActivitySeries } from '@/data/platformKpis';
import { MOCK_PLATFORM_RIDES } from '@/data/mockPlatformRides';
import {
  computeDailyQuality,
  computePaymentsByMethod,
  computeRidesByCategory,
  computeRidesByHour,
  computeRidesByZone,
  computeUserGrowth,
} from '@/data/analytics';
import { formatFare } from '@/utils/format';

const COMMISSION_RATE = 0.15;

type Period = 'today' | '7d' | '30d' | '90d' | 'custom';

const PERIOD_FILTERS: { id: Period; label: string }[] = [
  { id: 'today', label: "Aujourd'hui" },
  { id: '7d', label: '7 jours' },
  { id: '30d', label: '30 jours' },
  { id: '90d', label: '3 mois' },
  { id: 'custom', label: 'Personnalisée' },
];

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function daysSince(iso: string): number {
  const from = startOfDay(new Date(iso));
  const today = startOfDay(new Date());
  return Math.max(1, Math.round((today.getTime() - from.getTime()) / 86_400_000) + 1);
}

function CountTooltip({ active, payload, label, unit }: { active?: boolean; payload?: { value: number }[]; label?: string; unit: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-background px-3 py-2 text-xs shadow-elevated">
      <p className="font-semibold text-foreground">{label}</p>
      <p className="text-muted-foreground">
        <span className="font-semibold text-foreground">{payload[0].value}</span> {unit}
      </p>
    </div>
  );
}

function FareTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-background px-3 py-2 text-xs shadow-elevated">
      <p className="font-semibold text-foreground">{label}</p>
      <p className="font-semibold text-foreground">{formatFare(payload[0].value)}</p>
    </div>
  );
}

const AXIS_TICK = { fill: 'hsl(var(--muted-foreground))', fontSize: 11 };
const GRID_STROKE = 'hsl(var(--border))';
const BAR_FILL = 'hsl(var(--accent-600))';
const LINE_STROKE = 'hsl(var(--primary-800))';

export default function AdminAnalyticsPage() {
  const drivers = useAdminStore((s) => s.drivers);
  const payments = useAdminStore((s) => s.payments);

  const [period, setPeriod] = useState<Period>('30d');
  const [customFrom, setCustomFrom] = useState('');

  const days = useMemo(() => {
    if (period === 'today') return 1;
    if (period === '7d') return 7;
    if (period === '30d') return 30;
    if (period === '90d') return 90;
    return customFrom ? daysSince(customFrom) : 30;
  }, [period, customFrom]);

  const activity = useMemo(() => buildActivitySeries(days), [days]);
  const quality = useMemo(() => computeDailyQuality(days), [days]);
  const ridesByCategory = useMemo(() => computeRidesByCategory(days), [days]);
  const paymentsByMethod = useMemo(() => computePaymentsByMethod(days), [days]);
  const ridesByZone = useMemo(() => computeRidesByZone(days), [days]);
  const ridesByHour = useMemo(() => computeRidesByHour(days), [days]);
  const userGrowth = computeUserGrowth();
  const topDrivers = [...drivers].sort((a, b) => b.earningsToday - a.earningsToday).slice(0, 5);

  const periodRides = useMemo(() => {
    const cutoff = startOfDay(new Date());
    cutoff.setDate(cutoff.getDate() - days + 1);
    return MOCK_PLATFORM_RIDES.filter((r) => new Date(r.requestedAt) >= cutoff);
  }, [days]);
  const revenue = periodRides.filter((r) => r.status === 'COMPLETED').reduce((s, r) => s + r.fare, 0);
  const commission = Math.round(revenue * COMMISSION_RATE);
  const refundsTotal = useMemo(() => {
    const cutoff = startOfDay(new Date());
    cutoff.setDate(cutoff.getDate() - days + 1);
    return payments.filter((t) => t.description.startsWith('Remboursement') && new Date(t.date) >= cutoff).reduce((s, t) => s + t.amount, 0);
  }, [payments, days]);

  return (
    <div className="mx-auto max-w-6xl px-5 pb-10 pt-8 lg:px-8">
      <h1 className="font-display text-h2 text-foreground lg:hidden">Analytics</h1>

      <div className="mt-4 flex flex-col gap-3 lg:mt-0 sm:flex-row sm:items-center sm:gap-4">
        <FilterChips options={PERIOD_FILTERS} value={period} onChange={setPeriod} label="Filtrer par période" />
        {period === 'custom' && (
          <Input type="date" aria-label="Depuis le" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} className="sm:w-48" />
        )}
      </div>

      <p className="mb-3 mt-6 text-sm font-semibold text-foreground">Performance financière</p>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Revenus" value={formatFare(revenue)} icon={<TrendingUp className="h-5 w-5" />} />
        <StatCard label="Commission (15 %)" value={formatFare(commission)} icon={<Banknote className="h-5 w-5" />} />
        <StatCard label="Net" value={formatFare(revenue - commission)} icon={<Banknote className="h-5 w-5" />} />
        <StatCard label="Remboursements" value={formatFare(refundsTotal)} icon={<Undo2 className="h-5 w-5" />} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <p className="mb-4 text-sm font-semibold text-foreground">Courses</p>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activity} margin={{ top: 8, right: 8, left: -20, bottom: 0 }} barCategoryGap={days > 30 ? '10%' : '30%'}>
                <CartesianGrid vertical={false} stroke={GRID_STROKE} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tick={AXIS_TICK} interval={days > 14 ? Math.floor(days / 8) : 0} />
                <YAxis tickLine={false} axisLine={false} tick={AXIS_TICK} width={32} allowDecimals={false} />
                <Tooltip cursor={{ fill: 'hsl(var(--surface-hover))' }} content={<CountTooltip unit="courses" />} />
                <Bar dataKey="trips" fill={BAR_FILL} radius={[4, 4, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <p className="mb-4 text-sm font-semibold text-foreground">Revenus</p>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activity} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke={GRID_STROKE} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tick={AXIS_TICK} interval={days > 14 ? Math.floor(days / 8) : 0} />
                <YAxis tickLine={false} axisLine={false} tick={AXIS_TICK} width={48} tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : String(v))} />
                <Tooltip cursor={{ stroke: GRID_STROKE, strokeWidth: 1 }} content={<FareTooltip />} />
                <Line type="monotone" dataKey="revenue" stroke={LINE_STROKE} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <p className="mb-4 text-sm font-semibold text-foreground">Annulations — taux quotidien</p>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={quality} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke={GRID_STROKE} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tick={AXIS_TICK} interval={days > 14 ? Math.floor(days / 8) : 0} />
                <YAxis tickLine={false} axisLine={false} tick={AXIS_TICK} width={60} tickFormatter={(v) => `${v}%`} />
                <Tooltip cursor={{ stroke: GRID_STROKE, strokeWidth: 1 }} content={<CountTooltip unit="%" />} />
                <Line type="monotone" dataKey="cancellationRate" stroke="hsl(var(--danger))" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <p className="mb-4 text-sm font-semibold text-foreground">Satisfaction — note moyenne quotidienne</p>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={quality} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke={GRID_STROKE} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tick={AXIS_TICK} interval={days > 14 ? Math.floor(days / 8) : 0} />
                <YAxis domain={[0, 5]} tickLine={false} axisLine={false} tick={AXIS_TICK} width={40} />
                <Tooltip cursor={{ stroke: GRID_STROKE, strokeWidth: 1 }} content={<CountTooltip unit="/ 5" />} />
                <Line type="monotone" dataKey="averageRating" stroke="hsl(var(--secondary-700))" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <p className="mb-4 text-sm font-semibold text-foreground">Courses par catégorie</p>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ridesByCategory} margin={{ top: 8, right: 8, left: -20, bottom: 0 }} barCategoryGap="30%">
                <CartesianGrid vertical={false} stroke={GRID_STROKE} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tick={AXIS_TICK} />
                <YAxis tickLine={false} axisLine={false} tick={AXIS_TICK} width={36} allowDecimals={false} />
                <Tooltip cursor={{ fill: 'hsl(var(--surface-hover))' }} content={<CountTooltip unit="courses" />} />
                <Bar dataKey="count" fill={BAR_FILL} radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <p className="mb-4 text-sm font-semibold text-foreground">Volume réussi par méthode</p>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={paymentsByMethod} margin={{ top: 8, right: 8, left: -20, bottom: 0 }} barCategoryGap="30%">
                <CartesianGrid vertical={false} stroke={GRID_STROKE} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tick={AXIS_TICK} />
                <YAxis tickLine={false} axisLine={false} tick={AXIS_TICK} width={48} tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : String(v))} />
                <Tooltip cursor={{ fill: 'hsl(var(--surface-hover))' }} content={<FareTooltip />} />
                <Bar dataKey="amount" fill={BAR_FILL} radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <p className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
            <MapPin className="h-4 w-4" /> Zones les plus actives
          </p>
          <div className="space-y-2">
            {ridesByZone.map((z) => (
              <div key={z.zone} className="flex items-center justify-between rounded-lg border border-border px-3.5 py-2.5 text-body-sm">
                <span className="font-medium text-foreground">{z.zone}</span>
                <span className="text-muted-foreground">
                  {z.trips} course{z.trips > 1 ? 's' : ''} · <span className="font-semibold text-foreground">{formatFare(z.revenue)}</span>
                </span>
              </div>
            ))}
            {ridesByZone.length === 0 && <p className="text-body-sm text-muted-foreground">Aucune course sur cette période.</p>}
          </div>
        </Card>

        <Card>
          <p className="mb-4 text-sm font-semibold text-foreground">Courses par tranche horaire</p>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ridesByHour} margin={{ top: 8, right: 8, left: -20, bottom: 0 }} barCategoryGap="20%">
                <CartesianGrid vertical={false} stroke={GRID_STROKE} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ ...AXIS_TICK, fontSize: 10 }} interval={1} />
                <YAxis tickLine={false} axisLine={false} tick={AXIS_TICK} width={36} allowDecimals={false} />
                <Tooltip cursor={{ fill: 'hsl(var(--surface-hover))' }} content={<CountTooltip unit="courses" />} />
                <Bar dataKey="count" fill={BAR_FILL} radius={[4, 4, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <p className="mb-4 text-sm font-semibold text-foreground">Croissance des utilisateurs</p>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userGrowth} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke={GRID_STROKE} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tick={AXIS_TICK} padding={{ left: 16, right: 16 }} />
                <YAxis tickLine={false} axisLine={false} tick={AXIS_TICK} width={36} allowDecimals={false} />
                <Tooltip cursor={{ stroke: GRID_STROKE, strokeWidth: 1 }} content={<CountTooltip unit="nouveaux utilisateurs" />} />
                <Line type="monotone" dataKey="count" stroke={LINE_STROKE} strokeWidth={2} dot={{ r: 4, fill: LINE_STROKE }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="mt-6 flex items-center gap-2">
        <Trophy className="h-4 w-4 text-primary-700" />
        <p className="text-sm font-semibold text-foreground">Meilleurs chauffeurs du jour</p>
      </div>
      <Table className="mt-3">
        <TableHead>
          <TableRow>
            <TableHeaderCell>#</TableHeaderCell>
            <TableHeaderCell>Chauffeur</TableHeaderCell>
            <TableHeaderCell>Note</TableHeaderCell>
            <TableHeaderCell>Courses</TableHeaderCell>
            <TableHeaderCell>Gains</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {topDrivers.map((driver, index) => (
            <TableRow key={driver.id}>
              <TableCell className="font-semibold text-muted-foreground">{index + 1}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2.5">
                  <Avatar name={driver.name} src={driver.avatar} size="sm" />
                  <span className="font-medium">{driver.name}</span>
                </div>
              </TableCell>
              <TableCell>
                <Rating value={driver.rating} showValue size={12} />
              </TableCell>
              <TableCell>{driver.tripsCompleted}</TableCell>
              <TableCell className="font-semibold">{formatFare(driver.earningsToday)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
