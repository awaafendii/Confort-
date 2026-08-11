import React, { useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bike, Car, MessageCircle, Phone, Star } from 'lucide-react';
import { Avatar, Badge, Button, toast } from '@/components/ui';
import { MapView } from '@/components/map/MapView';
import { getNeighborhood, CONAKRY_MAP_CENTER } from '@/data/neighborhoods';
import { getNeighborhoodPath } from '@/data/pricing';
import { VEHICLE_COLORS } from '@/data/vehicleColors';
import { useAuthStore } from '@/features/auth/store';
import { useDriverSessionStore } from '@/features/drivers/driverSessionStore';
import { useNotificationsStore } from '@/features/notifications/notificationsStore';
import { useTripSimulation } from '@/features/rides/useTripSimulation';
import type { RideRequest } from '@/features/drivers/rideRequestSimulator';
import { formatFare } from '@/utils/format';
import type { Driver } from '@/types';

interface TrackingState {
  request?: RideRequest;
}

const STATUS_LABEL: Record<string, string> = {
  DRIVER_ASSIGNED: 'En route vers le passager',
  DRIVER_ARRIVING: 'Vous arrivez bientôt',
  DRIVER_ARRIVED: 'Vous êtes arrivé au point de départ',
  IN_PROGRESS: 'Trajet en cours',
};

export default function DriverTrackingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { request } = (location.state as TrackingState | null) ?? {};
  const account = useAuthStore((s) => s.account) as Driver | null;
  const updateAccount = useAuthStore((s) => s.updateAccount);
  const incrementTripsToday = useDriverSessionStore((s) => s.incrementTripsToday);
  const addNotification = useNotificationsStore((s) => s.addNotification);

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
    onComplete: () => {
      if (!account || !request) return;
      updateAccount({ earningsToday: account.earningsToday + request.fare });
      incrementTripsToday();
      addNotification({
        userId: account.id,
        type: 'RIDE',
        title: 'Course terminée',
        body: `Trajet avec ${request.passengerName} terminé — +${formatFare(request.fare)}.`,
      });
      toast.success(`Course terminée — +${formatFare(request.fare)}`);
      navigate('/driver', { replace: true });
    },
  });

  if (!request || !account || !pickup || !destination) return null;

  const color = VEHICLE_COLORS[account.vehicle.color];
  const fullRoute = [...toPickupPath, ...toDestinationPath.slice(1)];
  const isMoto = request.category === 'MOTO_SINGLE';

  return (
    <div className="relative h-screen w-full overflow-hidden bg-background">
      <div className="absolute inset-0">
        <MapView
          center={pickup.coords}
          zoom={13}
          route={fullRoute}
          markers={[
            { id: 'pickup', kind: 'pin', position: pickup.coords, color: '#1B6854' },
            { id: 'destination', kind: 'pin', position: destination.coords, color: '#0F2A4D' },
            { id: 'driver', kind: 'vehicle', position: sim.position, color: color.hex, vehicleType: account.vehicle.type, rotation: sim.heading },
          ]}
        />
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center px-4 pt-4">
        <div className="pointer-events-auto flex items-center gap-2 rounded-full bg-background/95 px-4 py-2 shadow-elevated backdrop-blur">
          <span className="h-2 w-2 rounded-full bg-secondary-600" />
          <span className="text-sm font-semibold text-foreground">{STATUS_LABEL[sim.status] ?? sim.status}</span>
        </div>
      </div>

      <div className="safe-bottom absolute inset-x-0 bottom-0 rounded-t-2xl border-t border-border bg-background px-5 pb-6 pt-4 shadow-sheet">
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-border" aria-hidden="true" />
        <div className="flex items-center gap-3.5">
          <Avatar name={request.passengerName} src={request.passengerAvatar} size="lg" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-foreground">{request.passengerName}</p>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="h-3 w-3 fill-warning text-warning" /> {request.passengerRating}
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-800">
            {isMoto ? <Bike className="h-5 w-5" /> : <Car className="h-5 w-5" />}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between rounded-xl bg-surface px-4 py-3">
          <span className="text-sm font-medium text-muted-foreground">
            {sim.status === 'IN_PROGRESS' ? destination.name : pickup.name}
          </span>
          <Badge variant="secondary">{sim.etaMin} min</Badge>
        </div>

        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Gains estimés</span>
          <span className="font-display text-base font-bold text-foreground">{formatFare(request.fare)}</span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <Button variant="outline" onClick={() => (window.location.href = `tel:${request.passengerPhone}`)}>
            <Phone className="h-4 w-4" /> Appeler
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              navigate('/driver/chat', {
                state: {
                  rideId: request.id,
                  myRole: 'DRIVER',
                  otherName: request.passengerName,
                  otherAvatar: request.passengerAvatar,
                  otherPhone: request.passengerPhone,
                },
              })
            }
          >
            <MessageCircle className="h-4 w-4" /> Message
          </Button>
        </div>
      </div>
    </div>
  );
}
