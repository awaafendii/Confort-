import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Ban, Car, DollarSign, Star, TrendingUp, Users } from 'lucide-react';
import { Badge, Button, Card, StatCard, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '@/components/ui';
import { computePlatformKpis, WEEKLY_TRIPS_SERIES } from '@/data/platformKpis';
import { MOCK_PLATFORM_RIDES } from '@/data/mockPlatformRides';
import { formatFare } from '@/utils/format';
import type { RideStatus } from '@/types';

const STATUS_BADGE: Record<RideStatus, { label: string; variant: 'success' | 'danger' | 'neutral' }> = {
  COMPLETED: { label: 'Terminée', variant: 'success' },
  CANCELLED: { label: 'Annulée', variant: 'danger' },
  IN_PROGRESS: { label: 'En cours', variant: 'neutral' },
  REQUESTED: { label: 'Demandée', variant: 'neutral' },
  SEARCHING_DRIVER: { label: 'Recherche', variant: 'neutral' },
  DRIVER_ASSIGNED: { label: 'Assignée', variant: 'neutral' },
  DRIVER_ARRIVING: { label: 'En approche', variant: 'neutral' },
  DRIVER_ARRIVED: { label: 'Chauffeur arrivé', variant: 'neutral' },
};

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-background px-3 py-2 text-xs shadow-elevated">
      <p className="font-semibold text-foreground">{label}</p>
      <p className="text-muted-foreground">
        <span className="font-semibold text-foreground">{payload[0].value}</span> courses
      </p>
    </div>
  );
}

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const kpis = computePlatformKpis();
  const recentRides = MOCK_PLATFORM_RIDES.slice(0, 5);

  return (
    <div className="mx-auto max-w-6xl px-5 pb-10 pt-8 lg:px-8">
      <h1 className="font-display text-h2 text-foreground lg:hidden">Dashboard</h1>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatCard label="Utilisateurs" value={String(kpis.totalUsers)} icon={<Users className="h-5 w-5" />} />
        <StatCard label="Chauffeurs actifs" value={String(kpis.activeDrivers)} icon={<Car className="h-5 w-5" />} />
        <StatCard label="Courses aujourd'hui" value={String(kpis.tripsToday)} icon={<TrendingUp className="h-5 w-5" />} />
        <StatCard label="Revenu du jour" value={formatFare(kpis.revenueToday)} icon={<DollarSign className="h-5 w-5" />} />
        <StatCard label="Taux d'annulation" value={`${Math.round(kpis.cancellationRate * 100)}%`} icon={<Ban className="h-5 w-5" />} />
        <StatCard label="Note moyenne" value={kpis.averageRating.toFixed(1)} icon={<Star className="h-5 w-5" />} />
      </div>

      <Card className="mt-6">
        <p className="mb-4 text-sm font-semibold text-foreground">Courses des 7 derniers jours</p>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={WEEKLY_TRIPS_SERIES} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barCategoryGap="30%">
              <CartesianGrid vertical={false} stroke="hsl(214 18% 90%)" />
              <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: '#5B6472', fontSize: 12 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: '#5B6472', fontSize: 12 }} width={40} />
              <Tooltip cursor={{ fill: 'hsl(210 20% 95%)' }} content={<ChartTooltip />} />
              <Bar dataKey="trips" fill="#0F2A4D" radius={[4, 4, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="mt-6 flex items-center justify-between">
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
            const status = STATUS_BADGE[ride.status];
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
  );
}
