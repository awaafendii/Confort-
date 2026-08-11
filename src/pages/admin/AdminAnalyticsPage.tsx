import React from 'react';
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
import { Trophy } from 'lucide-react';
import { Avatar, Card, Rating, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '@/components/ui';
import { useAdminStore } from '@/features/admin/adminStore';
import { WEEKLY_TRIPS_SERIES } from '@/data/platformKpis';
import { computePaymentsByMethod, computeRidesByCategory, computeUserGrowth } from '@/data/analytics';
import { formatFare } from '@/utils/format';

const BRAND_HUE = '#0F2A4D';
const AXIS_TICK = { fill: '#5B6472', fontSize: 12 };
const GRID_STROKE = 'hsl(214 18% 90%)';

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

export default function AdminAnalyticsPage() {
  const drivers = useAdminStore((s) => s.drivers);
  const ridesByCategory = computeRidesByCategory();
  const paymentsByMethod = computePaymentsByMethod();
  const userGrowth = computeUserGrowth();
  const topDrivers = [...drivers].sort((a, b) => b.earningsToday - a.earningsToday).slice(0, 5);

  return (
    <div className="mx-auto max-w-6xl px-5 pb-10 pt-8 lg:px-8">
      <h1 className="font-display text-h2 text-foreground lg:hidden">Analytics</h1>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:mt-0 lg:grid-cols-2">
        <Card>
          <p className="mb-4 text-sm font-semibold text-foreground">Revenu — 7 derniers jours</p>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={WEEKLY_TRIPS_SERIES} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke={GRID_STROKE} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={AXIS_TICK} padding={{ left: 16, right: 16 }} />
                <YAxis tickLine={false} axisLine={false} tick={AXIS_TICK} width={48} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip cursor={{ stroke: GRID_STROKE, strokeWidth: 1 }} content={<FareTooltip />} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke={BRAND_HUE}
                  strokeWidth={2}
                  dot={{ r: 4, fill: BRAND_HUE, stroke: 'hsl(var(--background))', strokeWidth: 2 }}
                  activeDot={{ r: 5, fill: BRAND_HUE, stroke: 'hsl(var(--background))', strokeWidth: 2 }}
                />
              </LineChart>
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
                <YAxis tickLine={false} axisLine={false} tick={AXIS_TICK} width={48} allowDecimals={false} />
                <Tooltip cursor={{ stroke: GRID_STROKE, strokeWidth: 1 }} content={<CountTooltip unit="nouveaux utilisateurs" />} />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke={BRAND_HUE}
                  strokeWidth={2}
                  dot={{ r: 4, fill: BRAND_HUE, stroke: 'hsl(var(--background))', strokeWidth: 2 }}
                  activeDot={{ r: 5, fill: BRAND_HUE, stroke: 'hsl(var(--background))', strokeWidth: 2 }}
                />
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
                <YAxis tickLine={false} axisLine={false} tick={AXIS_TICK} width={32} allowDecimals={false} />
                <Tooltip cursor={{ fill: 'hsl(210 20% 95%)' }} content={<CountTooltip unit="courses" />} />
                <Bar dataKey="count" fill={BRAND_HUE} radius={[4, 4, 0, 0]} maxBarSize={40} />
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
                <YAxis tickLine={false} axisLine={false} tick={AXIS_TICK} width={48} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip cursor={{ fill: 'hsl(210 20% 95%)' }} content={<FareTooltip />} />
                <Bar dataKey="amount" fill={BRAND_HUE} radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
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
