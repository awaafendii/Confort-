import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bike, Car, CheckCircle2, MapPin, MessageCircle, Navigation2, Phone, Share2, ShieldCheck, Star } from 'lucide-react';
import { Badge, type BadgeProps, Button, IconButton, Modal, toast } from '@/components/ui';
import { MapView } from '@/components/map/MapView';
import { MAP_MARKER_COLORS, SafetyPanel } from '@/components/business';
import { getNeighborhood, CONAKRY_MAP_CENTER } from '@/data/neighborhoods';
import { getNeighborhoodPath } from '@/data/pricing';
import { VEHICLE_COLORS } from '@/data/vehicleColors';
import { useAuthStore } from '@/features/auth/store';
import { useDriverSessionStore } from '@/features/drivers/driverSessionStore';
import { useNotificationsStore } from '@/features/notifications/notificationsStore';
import { useDriverRideHistoryStore } from '@/features/rides/driverRideHistoryStore';
import { useTripSimulation } from '@/features/rides/useTripSimulation';
import type { RideRequest } from '@/features/drivers/rideRequestSimulator';
import { formatFare } from '@/utils/format';
import type { Driver } from '@/types';

interface TrackingState {
  request?: RideRequest;
}

/** Chaque statut a sa propre icône + couleur, comme côté passager — un trajet ne doit jamais sembler figé. */
const STATUS_CONFIG: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; badge: NonNullable<BadgeProps['variant']> }> = {
  DRIVER_ASSIGNED: { label: 'En route vers le passager', icon: Car, badge: 'primary' },
  DRIVER_ARRIVING: { label: 'Vous arrivez bientôt', icon: Car, badge: 'warning' },
  DRIVER_ARRIVED: { label: 'Vous êtes arrivé au point de départ', icon: MapPin, badge: 'accent' },
  IN_PROGRESS: { label: 'Trajet en cours', icon: Navigation2, badge: 'primary' },
};

export default function DriverTrackingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { request } = (location.state as TrackingState | null) ?? {};
  const account = useAuthStore((s) => s.account) as Driver | null;
  const updateAccount = useAuthStore((s) => s.updateAccount);
  const incrementTripsToday = useDriverSessionStore((s) => s.incrementTripsToday);
  const addNotification = useNotificationsStore((s) => s.addNotification);
  const addRideToHistory = useDriverRideHistoryStore((s) => s.addRide);
  const [safetyOpen, setSafetyOpen] = useState(false);

  useEffect(() => {
    if (!request || !account) navigate('/driver', { replace: true });
  }, [request, account, navigate]);

  const pickup = request ? getNeighborhood(request.pickupId) : undefined;
  const destination = request ? getNeighborhood(request.destinationId) : undefined;

  const toDestinationPath = useMemo(
    () => (request ? getNeighborhoodPath(request.pickupId, request.destinationId).map((id) => getNeighborhood(id)!.coords) : []),
    [request]
  );
  const toPickupPath = useMemo(() => {
    if (!account || !pickup) return [];
    return [account.location ?? CONAKRY_MAP_CENTER, pickup.coords];
  }, [account, pickup]);

  const sim = useTripSimulation({
    toPickupPath: toPickupPath.length ? toPickupPath : [{ lat: 0, lng: 0 }, { lat: 0, lng: 0 }],
    toDestinationPath: toDestinationPath.length ? toDestinationPath : [{ lat: 0, lng: 0 }, { lat: 0, lng: 0 }],
    estimatedTotalMin: request?.durationMin ?? 8,
    manual: true,
    onComplete: () => {
      if (!account || !request || !pickup || !destination) return;
      updateAccount({ earningsToday: account.earningsToday + request.fare });
      incrementTripsToday();
      const now = new Date().toISOString();
      addRideToHistory({
        id: `dride-${Date.now()}`,
        passengerId: request.id,
        driverId: account.id,
        pickup: { label: pickup.name, address: `${pickup.name}, Conakry`, coords: pickup.coords },
        destination: { label: destination.name, address: `${destination.name}, Conakry`, coords: destination.coords },
        category: request.category,
        vehicleType: account.vehicle.type,
        status: 'COMPLETED',
        distanceKm: request.distanceKm,
        durationMin: request.durationMin,
        fare: request.fare,
        currency: 'GNF',
        paymentMethod: 'ESPECE',
        requestedAt: now,
        completedAt: now,
      });
      addNotification({
        userId: account.id,
        type: 'RIDE',
        title: 'Course terminée',
        body: `Trajet avec ${request.passengerName} terminé — +${formatFare(request.fare)}.`,
      });
      toast.success(`Course terminée — +${formatFare(request.fare)}`);
      navigate('/driver/ride-completed', {
        replace: true,
        state: {
          passengerName: request.passengerName,
          pickup: { label: pickup.name, address: `${pickup.name}, Conakry`, coords: pickup.coords },
          destination: { label: destination.name, address: `${destination.name}, Conakry`, coords: destination.coords },
          distanceKm: request.distanceKm,
          durationMin: request.durationMin,
          fare: request.fare,
        },
      });
    },
  });

  if (!request || !account || !pickup || !destination) return null;

  const color = VEHICLE_COLORS[account.vehicle.color];
  const fullRoute = [...toPickupPath, ...toDestinationPath.slice(1)];
  const isMoto = request.category === 'MOTO_SINGLE';
  const statusInfo = STATUS_CONFIG[sim.status] ?? { label: sim.status, icon: Car, badge: 'neutral' as const };
  const StatusIcon = statusInfo.icon;

  const shareTrip = async () => {
    const text = `Je conduis ${request.passengerName} vers ${destination.name} avec Confort+.`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Ma course Confort+', text });
      } catch {
        // Boîte de partage native annulée par le chauffeur — rien à signaler.
      }
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      toast.success('Détails de la course copiés.');
    } else {
      toast('Partage indisponible sur cet appareil.');
    }
  };
  const contactSupport = () => navigate('/driver/profile/help');
  const reportIssue = () => {
    setSafetyOpen(false);
    toast.success('Signalement envoyé à notre équipe.');
  };
  const triggerSOS = () => {
    setSafetyOpen(false);
    toast.error('SOS activé — alerte enregistrée.');
  };

  const manualAction = sim.awaitingArrival
    ? { label: 'Je suis arrivé', icon: MapPin, onClick: sim.confirmArrival }
    : sim.awaitingStart
      ? { label: 'Démarrer la course', icon: Navigation2, onClick: sim.confirmStart }
      : sim.awaitingFinish
        ? { label: 'Terminer la course', icon: CheckCircle2, onClick: sim.confirmFinish }
        : null;

  return (
    <div className="relative h-screen w-full overflow-hidden bg-background">
      <div className="absolute inset-0">
        <MapView
          center={pickup.coords}
          zoom={13}
          route={fullRoute}
          markers={[
            { id: 'pickup', kind: 'pin', position: pickup.coords, color: MAP_MARKER_COLORS.pickup },
            { id: 'destination', kind: 'pin', position: destination.coords, color: MAP_MARKER_COLORS.destination },
            { id: 'driver', kind: 'vehicle', position: sim.position, color: color.hex, vehicleType: account.vehicle.type, rotation: sim.heading },
          ]}
        />
      </div>

      <div aria-live="polite" className="pointer-events-none absolute inset-x-0 top-0 flex justify-center px-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <Badge variant={statusInfo.badge} className="gap-2 px-4 py-2 text-body-sm shadow-elevated backdrop-blur">
          <StatusIcon className="h-4 w-4" aria-hidden="true" />
          {statusInfo.label}
        </Badge>
      </div>

      <div className="safe-bottom absolute inset-x-0 bottom-0 rounded-t-2xl border-t border-border bg-background px-5 pb-6 pt-4 shadow-sheet">
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-border" aria-hidden="true" />
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-800">
            {isMoto ? <Bike className="h-5 w-5" /> : <Car className="h-5 w-5" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-foreground">{request.passengerName}</p>
            <p className="flex items-center gap-1 text-caption text-muted-foreground">
              <Star className="h-3 w-3 fill-warning text-warning" /> {request.passengerRating}
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between rounded-xl bg-surface px-4 py-3">
          <span className="text-body-sm font-medium text-muted-foreground">
            {sim.status === 'IN_PROGRESS' ? destination.name : pickup.name}
          </span>
          <Badge variant="secondary">{sim.etaMin} min</Badge>
        </div>

        <div className="mt-3 flex items-center justify-between text-body-sm">
          <span className="text-muted-foreground">Gains estimés</span>
          <span className="font-display text-h3 text-foreground">{formatFare(request.fare)}</span>
        </div>

        <div className="mt-4 grid grid-cols-4 gap-2">
          <ActionButton icon={<Phone className="h-4 w-4" />} label="Appeler" onClick={() => (window.location.href = `tel:${request.passengerPhone}`)} />
          <ActionButton
            icon={<MessageCircle className="h-4 w-4" />}
            label="Message"
            onClick={() =>
              navigate('/driver/chat', {
                state: { rideId: request.id, myRole: 'DRIVER', otherName: request.passengerName, otherAvatar: request.passengerAvatar, otherPhone: request.passengerPhone },
              })
            }
          />
          <ActionButton icon={<Share2 className="h-4 w-4" />} label="Partager" onClick={shareTrip} />
          <ActionButton icon={<ShieldCheck className="h-4 w-4" />} label="Sécurité" onClick={() => setSafetyOpen(true)} />
        </div>

        {manualAction && (
          <Button variant="primary" size="lg" className="mt-4 w-full" onClick={manualAction.onClick}>
            <manualAction.icon className="h-4 w-4" /> {manualAction.label}
          </Button>
        )}
      </div>

      <Modal open={safetyOpen} onClose={() => setSafetyOpen(false)} title="Sécurité">
        <SafetyPanel
          onShareTrip={() => {
            setSafetyOpen(false);
            shareTrip();
          }}
          onCallDriver={() => (window.location.href = `tel:${request.passengerPhone}`)}
          callLabel="Appeler le passager"
          onContactSupport={contactSupport}
          onReportIssue={reportIssue}
          onSOS={triggerSOS}
        />
      </Modal>
    </div>
  );
}

function ActionButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <IconButton icon={icon} aria-label={label} variant="outline" onClick={onClick} />
      <span className="text-caption font-medium text-muted-foreground">{label}</span>
    </div>
  );
}
