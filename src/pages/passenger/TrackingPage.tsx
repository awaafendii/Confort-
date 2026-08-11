import React, { useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MessageCircle, Phone } from 'lucide-react';
import { Avatar, Badge, Button, Rating, toast } from '@/components/ui';
import { MapView } from '@/components/map/MapView';
import { getNeighborhood } from '@/data/neighborhoods';
import { calculateFaresByCategory, calculateRouteEstimate, getNeighborhoodPath, RIDE_CATEGORIES_CONFIG } from '@/data/pricing';
import { VEHICLE_COLORS } from '@/data/vehicleColors';
import { useAuthStore } from '@/features/auth/store';
import { useNotificationsStore } from '@/features/notifications/notificationsStore';
import { useTripSimulation } from '@/features/rides/useTripSimulation';
import { formatFare } from '@/utils/format';
import type { Driver, PaymentMethod, RideCategory } from '@/types';

const ORIGIN_ID = 'kaloum';

interface TrackingState {
  destinationId?: string;
  category?: RideCategory;
  paymentMethod?: PaymentMethod;
  driver?: Driver;
}

const STATUS_LABEL: Record<string, string> = {
  DRIVER_ASSIGNED: 'Chauffeur en route vers vous',
  DRIVER_ARRIVING: 'Chauffeur bientôt arrivé',
  DRIVER_ARRIVED: 'Votre chauffeur est arrivé',
  IN_PROGRESS: 'Trajet en cours',
};

export default function TrackingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const account = useAuthStore((s) => s.account);
  const addNotification = useNotificationsStore((s) => s.addNotification);
  const { destinationId, category, paymentMethod, driver } = (location.state as TrackingState | null) ?? {};

  useEffect(() => {
    if (!destinationId || !category || !driver) navigate('/passenger', { replace: true });
  }, [destinationId, category, driver, navigate]);

  const pickup = getNeighborhood(ORIGIN_ID);
  const destination = destinationId ? getNeighborhood(destinationId) : undefined;

  const toDestinationPath = useMemo(
    () => (destinationId ? getNeighborhoodPath(ORIGIN_ID, destinationId).map((id) => getNeighborhood(id)!.coords) : []),
    [destinationId]
  );
  const toPickupPath = useMemo(() => {
    if (!pickup) return [];
    const jitterLat = pickup.coords.lat + 0.012;
    const jitterLng = pickup.coords.lng - 0.01;
    return [{ lat: jitterLat, lng: jitterLng }, pickup.coords];
  }, [pickup]);

  const estimate = destinationId ? calculateRouteEstimate(ORIGIN_ID, destinationId, category ?? 'STANDARD') : null;

  const sim = useTripSimulation({
    toPickupPath: toPickupPath.length ? toPickupPath : [{ lat: 0, lng: 0 }, { lat: 0, lng: 0 }],
    toDestinationPath: toDestinationPath.length ? toDestinationPath : [{ lat: 0, lng: 0 }, { lat: 0, lng: 0 }],
    estimatedTotalMin: estimate?.durationMin ?? 8,
    onComplete: () => {
      if (!destinationId || !category || !driver || !destination || !pickup) return;
      if (account) {
        addNotification({
          userId: account.id,
          type: 'RIDE',
          title: 'Trajet terminé',
          body: `Vous êtes arrivé à ${destination.name} avec ${driver.name.split(' ')[0]}.`,
        });
      }
      navigate('/passenger/ride-completed', {
        replace: true,
        state: {
          driver,
          category,
          paymentMethod: paymentMethod ?? 'ESPECE',
          pickup: { label: pickup.name, address: `${pickup.name}, Conakry`, coords: pickup.coords },
          destination: { label: destination.name, address: `${destination.name}, Conakry`, coords: destination.coords },
          distanceKm: estimate?.distanceKm ?? 0,
          durationMin: estimate?.durationMin ?? 0,
          fare: calculateFaresByCategory(ORIGIN_ID, destinationId)[category],
        },
      });
    },
  });

  if (!destinationId || !category || !driver || !destination || !pickup) return null;

  const color = VEHICLE_COLORS[driver.vehicle.color];
  const fullRoute = [...toPickupPath, ...toDestinationPath.slice(1)];
  const canCancel = sim.status === 'DRIVER_ASSIGNED' || sim.status === 'DRIVER_ARRIVING';

  const cancel = () => {
    toast('Course annulée.');
    navigate('/passenger', { replace: true });
  };

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
            { id: 'driver', kind: 'vehicle', position: sim.position, color: color.hex, vehicleType: driver.vehicle.type, rotation: sim.heading },
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
          <Avatar name={driver.name} src={driver.avatar} size="lg" status="online" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-foreground">{driver.name}</p>
            <Rating value={driver.rating} showValue size={14} />
          </div>
          <Badge variant="secondary">{sim.status === 'COMPLETED' ? 'Arrivé' : `${sim.etaMin} min`}</Badge>
        </div>

        <div className="mt-3 flex items-center gap-3 rounded-xl bg-surface px-3.5 py-2.5">
          <span className="h-7 w-7 shrink-0 rounded-full border border-border" style={{ backgroundColor: color.hex }} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">
              {driver.vehicle.brand} {driver.vehicle.model} · {color.label}
            </p>
            <p className="text-xs text-muted-foreground">{driver.vehicle.plateNumber}</p>
          </div>
          <span className="shrink-0 text-xs font-semibold text-muted-foreground">{RIDE_CATEGORIES_CONFIG[category].label}</span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <Button variant="outline" onClick={() => (window.location.href = `tel:${driver.phone}`)}>
            <Phone className="h-4 w-4" /> Appeler
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              navigate('/passenger/chat', {
                state: { rideId: driver.id, myRole: 'PASSENGER', otherName: driver.name, otherAvatar: driver.avatar, otherPhone: driver.phone },
              })
            }
          >
            <MessageCircle className="h-4 w-4" /> Message
          </Button>
        </div>

        {canCancel && (
          <Button variant="ghost" size="lg" className="mt-3 w-full text-danger hover:bg-danger/10" onClick={cancel}>
            Annuler la course
          </Button>
        )}
      </div>
    </div>
  );
}
