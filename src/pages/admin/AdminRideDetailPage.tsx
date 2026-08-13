import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, RouteOff } from 'lucide-react';
import { BackButton, Button, Card, EmptyState, Modal, StatusBadge, Textarea, toast } from '@/components/ui';
import { PriceBreakdown, MAP_MARKER_COLORS } from '@/components/business';
import { RIDE_STATUS_CONFIG, RIDE_STATUS_ORDER } from '@/components/admin';
import { MapView } from '@/components/map/MapView';
import { MOCK_PLATFORM_RIDES } from '@/data/mockPlatformRides';
import { MOCK_PLATFORM_USERS } from '@/data/mockUsers';
import { useAdminStore } from '@/features/admin/adminStore';
import { formatDistance, formatDuration } from '@/utils/format';
import { cn } from '@/lib/utils';
import type { PaymentMethod, Ride } from '@/types';

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  ESPECE: 'Espèces',
  ORANGE_MONEY: 'Orange Money',
  MOMO: 'MoMo',
  PAYCARD: 'Carte',
  VISA: 'Carte bancaire',
  KULU: 'Kulu',
};

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function nameFor(id: string, drivers: { id: string; name: string }[]): string {
  return MOCK_PLATFORM_USERS.find((u) => u.id === id)?.name ?? drivers.find((d) => d.id === id)?.name ?? id;
}

function StatusTimeline({ ride }: { ride: Ride }) {
  if (ride.status === 'CANCELLED') {
    return (
      <div className="flex gap-3">
        <div className="flex flex-col items-center pt-1.5">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-primary-800" aria-hidden="true" />
          <span className="my-1 w-px flex-1 bg-border" aria-hidden="true" />
          <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-danger" aria-hidden="true" />
        </div>
        <div className="flex flex-1 flex-col gap-4">
          <div>
            <p className="text-body font-semibold text-foreground">Demandée</p>
            <p className="text-body-sm text-muted-foreground">{formatDateTime(ride.requestedAt)}</p>
          </div>
          <div>
            <p className="text-body font-semibold text-danger">Annulée</p>
          </div>
        </div>
      </div>
    );
  }

  const currentIndex = RIDE_STATUS_ORDER.indexOf(ride.status);

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        {RIDE_STATUS_ORDER.map((status, i) => (
          <React.Fragment key={status}>
            <span className={cn('h-2.5 w-2.5 shrink-0 rounded-full', i <= currentIndex ? 'bg-accent-600' : 'bg-border')} aria-hidden="true" />
            {i < RIDE_STATUS_ORDER.length - 1 && <span className="my-1 w-px flex-1 bg-border" aria-hidden="true" />}
          </React.Fragment>
        ))}
      </div>
      <div className="flex flex-1 flex-col gap-4">
        {RIDE_STATUS_ORDER.map((status, i) => (
          <div key={status}>
            <p className={cn('text-body font-semibold', i <= currentIndex ? 'text-foreground' : 'text-muted-foreground')}>
              {RIDE_STATUS_CONFIG[status].label}
            </p>
            {status === 'REQUESTED' && <p className="text-body-sm text-muted-foreground">{formatDateTime(ride.requestedAt)}</p>}
            {status === 'COMPLETED' && ride.completedAt && i <= currentIndex && (
              <p className="text-body-sm text-muted-foreground">{formatDateTime(ride.completedAt)}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminRideDetailPage() {
  const { rideId } = useParams();
  const navigate = useNavigate();
  const drivers = useAdminStore((s) => s.drivers);
  const reportRideIncident = useAdminStore((s) => s.reportRideIncident);

  const [incidentOpen, setIncidentOpen] = useState(false);
  const [incidentReason, setIncidentReason] = useState('');

  const ride = MOCK_PLATFORM_RIDES.find((r) => r.id === rideId);

  if (!ride) {
    return (
      <div className="mx-auto max-w-3xl px-5 pb-10 pt-8 lg:px-8">
        <BackButton className="mb-2" to="/admin/rides" />
        <EmptyState icon={<RouteOff className="h-7 w-7" />} title="Course introuvable" description="Cette course n'existe pas ou plus." className="mt-6" />
      </div>
    );
  }

  const status = RIDE_STATUS_CONFIG[ride.status];
  const passengerName = nameFor(ride.passengerId, drivers);
  const driver = ride.driverId ? drivers.find((d) => d.id === ride.driverId) : undefined;
  const driverName = ride.driverId ? nameFor(ride.driverId, drivers) : null;
  const midpoint = {
    lat: (ride.pickup.coords.lat + ride.destination.coords.lat) / 2,
    lng: (ride.pickup.coords.lng + ride.destination.coords.lng) / 2,
  };

  const submitIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!incidentReason.trim()) return;
    reportRideIncident(`${ride.pickup.label} → ${ride.destination.label}`, incidentReason.trim());
    toast.success('Incident enregistré dans le journal d’audit.');
    setIncidentReason('');
    setIncidentOpen(false);
  };

  return (
    <div className="mx-auto max-w-3xl px-5 pb-10 pt-8 lg:px-8">
      <BackButton className="mb-2" to="/admin/rides" />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-h2 text-foreground">
          {ride.pickup.label} → {ride.destination.label}
        </h1>
        <StatusBadge status={ride.status} config={RIDE_STATUS_CONFIG} />
      </div>

      <div className="mt-5 h-56 w-full overflow-hidden rounded-2xl border border-border">
        <MapView
          center={midpoint}
          zoom={12}
          interactive={false}
          markers={[
            { id: 'pickup', position: ride.pickup.coords, kind: 'pin', color: MAP_MARKER_COLORS.pickup },
            { id: 'destination', position: ride.destination.coords, kind: 'pin', color: MAP_MARKER_COLORS.destination },
          ]}
          route={[ride.pickup.coords, ride.destination.coords]}
          className="h-full w-full"
        />
      </div>

      <Card className="mt-5">
        <p className="mb-4 text-body-sm font-semibold text-foreground">Trajet</p>
        <StatusTimeline ride={ride} />
      </Card>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Card>
          <p className="mb-1 text-caption text-muted-foreground">Passager</p>
          <button onClick={() => navigate(`/admin/users?q=${encodeURIComponent(passengerName)}`)} className="text-body font-semibold text-foreground hover:underline">
            {passengerName}
          </button>
        </Card>
        <Card>
          <p className="mb-1 text-caption text-muted-foreground">Chauffeur</p>
          {driver ? (
            <button onClick={() => navigate(`/admin/drivers/${driver.id}`)} className="text-body font-semibold text-foreground hover:underline">
              {driverName}
            </button>
          ) : (
            <p className="text-body font-semibold text-muted-foreground">Non assigné</p>
          )}
        </Card>
      </div>

      <Card className="mt-3">
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-body-sm">
            <span className="text-muted-foreground">Distance</span>
            <span className="font-medium text-foreground">{formatDistance(ride.distanceKm)}</span>
          </div>
          <div className="flex items-center justify-between text-body-sm">
            <span className="text-muted-foreground">Durée</span>
            <span className="font-medium text-foreground">{formatDuration(ride.durationMin)}</span>
          </div>
          <div className="flex items-center justify-between text-body-sm">
            <span className="text-muted-foreground">Catégorie</span>
            <span className="font-medium text-foreground">{ride.category}</span>
          </div>
          <div className="flex items-center justify-between text-body-sm">
            <span className="text-muted-foreground">Paiement</span>
            <span className="font-medium text-foreground">{PAYMENT_LABELS[ride.paymentMethod]}</span>
          </div>
        </div>
      </Card>

      {ride.status === 'COMPLETED' && (
        <Card className="mt-3">
          <PriceBreakdown items={[{ label: ride.category, amount: ride.fare }]} total={ride.fare} />
        </Card>
      )}

      <Button variant="outline" className="mt-5 w-full" onClick={() => setIncidentOpen(true)}>
        <AlertTriangle className="h-4 w-4" /> Signaler un incident
      </Button>

      <Modal open={incidentOpen} onClose={() => setIncidentOpen(false)} title="Signaler un incident">
        <form onSubmit={submitIncident} className="space-y-4">
          <Textarea
            label="Description"
            placeholder="Décrivez l'incident constaté sur cette course..."
            value={incidentReason}
            onChange={(e) => setIncidentReason(e.target.value)}
            required
          />
          <p className="text-caption text-muted-foreground">Enregistré dans le journal d’audit, visible par les Super Admins.</p>
          <Button type="submit" variant="primary" className="w-full" disabled={!incidentReason.trim()}>
            Signaler
          </Button>
        </form>
      </Modal>
    </div>
  );
}
