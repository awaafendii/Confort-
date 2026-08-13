import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Bike, Car, ChevronRight, Navigation2, Star, TrendingUp, Users, Wallet } from 'lucide-react';
import { Avatar, Badge, Button, Card, Skeleton, StatCard, toast } from '@/components/ui';
import { MapView, type MapMarkerSpec } from '@/components/map/MapView';
import { MAP_MARKER_COLORS } from '@/components/business';
import { useAuthStore } from '@/features/auth/store';
import { useDriverSessionStore } from '@/features/drivers/driverSessionStore';
import { generateRideRequest, type RideRequest } from '@/features/drivers/rideRequestSimulator';
import { useDriverRideHistoryStore } from '@/features/rides/driverRideHistoryStore';
import { getNeighborhood, CONAKRY_MAP_CENTER } from '@/data/neighborhoods';
import { NEARBY_VEHICLE_MARKERS } from '@/data/nearbyVehicleMarkers';
import { RIDE_CATEGORIES_CONFIG } from '@/data/pricing';
import { VEHICLE_COLORS } from '@/data/vehicleColors';
import { formatDistance, formatDuration, formatFare, formatRelativeTime } from '@/utils/format';
import type { Driver } from '@/types';
import { cn } from '@/lib/utils';

const REQUEST_INTERVAL_MS = 5000;
const COUNTDOWN_MS = 15000;
const RECENT_ACTIVITY_COUNT = 3;

type RequestState = 'idle' | 'incoming' | 'active';

/** Repère numérique du countdown (audit : la barre de progression seule n'en donnait aucun). */
function useCountdown(receivedAt: number | null, durationMs: number): number | null {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (receivedAt === null) return;
    const interval = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(interval);
  }, [receivedAt]);
  if (receivedAt === null) return null;
  return Math.max(0, Math.ceil((durationMs - (now - receivedAt)) / 1000));
}

function DriverHomeSkeleton() {
  return (
    <div role="status" aria-label="Chargement" className="mx-auto max-w-md px-5 pb-10 pt-8 lg:max-w-2xl lg:px-8">
      <Skeleton className="h-7 w-24" />
      <Skeleton className="mt-5 h-16 w-full rounded-lg" />
      <div className="mt-5 grid grid-cols-2 gap-3">
        <Skeleton className="h-20 rounded-lg" />
        <Skeleton className="h-20 rounded-lg" />
        <Skeleton className="h-20 rounded-lg" />
        <Skeleton className="h-20 rounded-lg" />
      </div>
      <Skeleton className="mt-5 h-48 w-full rounded-lg" />
    </div>
  );
}

export default function DriverHomePage() {
  const navigate = useNavigate();
  const account = useAuthStore((s) => s.account) as Driver | null;
  const updateAccount = useAuthStore((s) => s.updateAccount);
  const tripsToday = useDriverSessionStore((s) => s.tripsToday);
  const driverRides = useDriverRideHistoryStore((s) => s.rides);

  const [requestState, setRequestState] = useState<RequestState>('idle');
  const [currentRequest, setCurrentRequest] = useState<RideRequest | null>(null);
  const [requestReceivedAt, setRequestReceivedAt] = useState<number | null>(null);

  const isOnline = account?.status === 'ONLINE';

  // Lu à l'intérieur des callbacks de setTimeout pour éviter qu'un minuteur
  // en retard (onglet en arrière-plan throttlé par le navigateur) ne fasse
  // apparaître une demande juste après un passage hors ligne : la fermeture
  // du useEffect peut être annulée avant l'exécution du timeout, mais un
  // navigateur qui retarde fortement les timers peut malgré tout laisser
  // le callback s'exécuter avant que le cleanup n'ait eu la main.
  const isOnlineRef = useRef(isOnline);
  useEffect(() => {
    isOnlineRef.current = isOnline;
  }, [isOnline]);

  useEffect(() => {
    if (!isOnline || requestState !== 'idle') return;
    const timeout = setTimeout(() => {
      if (!isOnlineRef.current) return;
      setCurrentRequest(generateRideRequest(account!.vehicle.type));
      setRequestReceivedAt(Date.now());
      setRequestState('incoming');
    }, REQUEST_INTERVAL_MS);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline, requestState]);

  useEffect(() => {
    if (requestState !== 'incoming') return;
    const timeout = setTimeout(() => {
      if (!isOnlineRef.current) return;
      decline(true);
    }, COUNTDOWN_MS);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestState, currentRequest]);

  if (!account) return <DriverHomeSkeleton />;

  const toggleOnline = () => {
    const next = isOnline ? 'OFFLINE' : 'ONLINE';
    updateAccount({ status: next });
    if (next === 'OFFLINE') {
      setRequestState('idle');
      setCurrentRequest(null);
      setRequestReceivedAt(null);
    }
  };

  const decline = (auto = false) => {
    setCurrentRequest(null);
    setRequestReceivedAt(null);
    setRequestState('idle');
    toast(auto ? 'Course expirée — non attribuée.' : 'Course refusée.');
  };

  const accept = () => setRequestState('active');

  const navigateToRide = () => {
    if (!currentRequest) return;
    navigate('/driver/tracking', { state: { request: currentRequest } });
  };

  const recentRides = driverRides.slice(0, RECENT_ACTIVITY_COUNT);

  return (
    <div className="mx-auto max-w-md px-5 pb-10 pt-8 lg:max-w-2xl lg:px-8">
      <h1 className="mb-5 font-display text-h2 text-foreground lg:hidden">Accueil</h1>

      <Card className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={cn('h-2.5 w-2.5 rounded-full', isOnline ? 'bg-secondary-600' : 'bg-muted-foreground')} />
          <div>
            <p className="text-body-sm font-semibold text-foreground">{isOnline ? 'En ligne' : 'Hors ligne'}</p>
            <p className="text-caption text-muted-foreground">{isOnline ? 'Vous recevez des courses' : 'Passez en ligne pour recevoir des courses'}</p>
          </div>
        </div>
        <button
          role="switch"
          aria-checked={isOnline}
          aria-label="Basculer en ligne"
          onClick={toggleOnline}
          className={cn(
            'relative h-8 w-14 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            isOnline ? 'bg-secondary-700' : 'bg-border'
          )}
        >
          <span
            className={cn(
              'absolute top-1 h-6 w-6 rounded-full bg-white shadow-card transition-transform',
              isOnline ? 'translate-x-7' : 'translate-x-1'
            )}
          />
        </button>
      </Card>

      <div className="mb-5 grid grid-cols-2 gap-3">
        <StatCard label="Gains aujourd'hui" value={formatFare(account.earningsToday)} icon={<Wallet className="h-5 w-5" />} />
        <StatCard label="Courses aujourd'hui" value={String(tripsToday)} icon={<Car className="h-5 w-5" />} />
        <StatCard label="Note" value={account.rating.toFixed(2)} icon={<Star className="h-5 w-5" />} />
        <StatCard label="Taux d'acceptation" value={`${Math.round(account.acceptanceRate * 100)}%`} icon={<TrendingUp className="h-5 w-5" />} />
      </div>

      <AnimatePresence mode="wait">
        {requestState === 'idle' && (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Card noPadding className="overflow-hidden">
              <div className="h-48 w-full">
                <MapView
                  center={account.location ?? CONAKRY_MAP_CENTER}
                  zoom={12.5}
                  interactive={false}
                  markers={[
                    {
                      id: 'self',
                      kind: 'vehicle',
                      position: account.location ?? CONAKRY_MAP_CENTER,
                      color: VEHICLE_COLORS[account.vehicle.color].hex,
                      vehicleType: account.vehicle.type,
                    } satisfies MapMarkerSpec,
                    ...NEARBY_VEHICLE_MARKERS,
                  ]}
                />
              </div>
              <div className="p-4">
                <p className="text-body-sm font-semibold text-foreground">
                  {isOnline ? 'En attente de courses...' : 'Vous êtes hors ligne'}
                </p>
                <p className="mt-1 text-caption text-muted-foreground">
                  {isOnline
                    ? 'Restez en ligne : une demande de course vous sera envoyée dès qu’elle sera disponible.'
                    : 'Activez le statut « En ligne » pour commencer à recevoir des courses.'}
                </p>
              </div>
            </Card>
          </motion.div>
        )}

        {requestState !== 'idle' && currentRequest && (
          <RequestCard
            key={requestState === 'incoming' ? currentRequest.id : 'active'}
            request={currentRequest}
            active={requestState === 'active'}
            receivedAt={requestReceivedAt}
            onAccept={accept}
            onDecline={() => decline(false)}
            onNavigate={navigateToRide}
          />
        )}
      </AnimatePresence>

      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-body-sm font-semibold text-foreground">Activité récente</p>
          <button
            type="button"
            onClick={() => navigate('/driver/trips')}
            className="flex items-center gap-0.5 rounded-sm text-caption font-semibold text-primary-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Voir tout <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
        <div className="space-y-2">
          {recentRides.map((ride) => {
            const isMoto = ride.vehicleType === 'MOTO';
            return (
              <Card key={ride.id} noPadding className="flex items-center gap-3 px-4 py-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary-50 text-primary-800">
                  {isMoto ? <Bike className="h-4 w-4" /> : <Car className="h-4 w-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-body-sm font-medium text-foreground">
                    {ride.pickup.label} → {ride.destination.label}
                  </p>
                  <p className="text-caption text-muted-foreground">{formatRelativeTime(ride.requestedAt)}</p>
                </div>
                <p className="shrink-0 text-body-sm font-semibold text-secondary-700">+{formatFare(ride.fare)}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function RequestCard({
  request,
  active,
  receivedAt,
  onAccept,
  onDecline,
  onNavigate,
}: {
  request: RideRequest;
  active: boolean;
  receivedAt: number | null;
  onAccept: () => void;
  onDecline: () => void;
  onNavigate: () => void;
}) {
  const pickup = getNeighborhood(request.pickupId)!;
  const destination = getNeighborhood(request.destinationId)!;
  const isMoto = request.category === 'MOTO_SINGLE';
  const secondsLeft = useCountdown(active ? null : receivedAt, COUNTDOWN_MS);
  // Pas de prop `route` ici : MapView.fitBounds plante (LngLat NaN) quand la carte est montée
  // pendant une animation d'entrée Framer Motion (conteneur à largeur/hauteur pas encore stable
  // au moment où l'événement `load` de MapLibre se déclenche) — reproduit en Chrome sur cet écran.
  // Un simple centrage sur le point milieu évite ce chemin de code sans perdre l'info spatiale utile.
  const previewCenter = { lat: (pickup.coords.lat + destination.coords.lat) / 2, lng: (pickup.coords.lng + destination.coords.lng) / 2 };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card noPadding className="overflow-hidden">
        {!active && (
          <div className="flex items-center gap-2.5 bg-surface px-4 py-1.5">
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-border">
              <motion.div
                className={cn('h-full', secondsLeft !== null && secondsLeft <= 5 ? 'bg-danger' : 'bg-primary-700')}
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: COUNTDOWN_MS / 1000, ease: 'linear' }}
              />
            </div>
            <span
              aria-live="polite"
              className={cn(
                'shrink-0 text-caption font-semibold tabular-nums',
                secondsLeft !== null && secondsLeft <= 5 ? 'text-danger' : 'text-muted-foreground'
              )}
            >
              {secondsLeft ?? Math.round(COUNTDOWN_MS / 1000)}s
            </span>
          </div>
        )}
        {!active && (
          <div className="h-32 w-full">
            <MapView
              center={previewCenter}
              zoom={11.5}
              interactive={false}
              markers={[
                { id: 'pickup', kind: 'pin', position: pickup.coords, color: MAP_MARKER_COLORS.pickup },
                { id: 'destination', kind: 'pin', position: destination.coords, color: MAP_MARKER_COLORS.destination },
              ]}
            />
          </div>
        )}
        <div className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <Badge variant={active ? 'secondary' : 'primary'}>{active ? 'Course en cours' : 'Nouvelle course'}</Badge>
            <Badge variant="neutral">{RIDE_CATEGORIES_CONFIG[request.category].label}</Badge>
          </div>

          <div className="flex items-center gap-3.5">
            <Avatar name={request.passengerName} src={request.passengerAvatar} size="lg" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-foreground">{request.passengerName}</p>
              <p className="flex items-center gap-1 text-caption text-muted-foreground">
                <Star className="h-3 w-3 fill-warning text-warning" /> {request.passengerRating}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-800">
              {isMoto ? <Bike className="h-5 w-5" /> : <Car className="h-5 w-5" />}
            </div>
          </div>

          <div className="mt-4 flex items-start gap-3 border-t border-border pt-4">
            <div className="mt-1 flex flex-col items-center">
              <span className="h-2.5 w-2.5 rounded-full bg-secondary-700" />
              <span className="my-0.5 h-6 w-px border-l border-dashed border-border" />
              <span className="h-2.5 w-2.5 rounded-full bg-primary-800" />
            </div>
            <div className="flex-1 space-y-3">
              <p className="text-body-sm font-medium text-foreground">{pickup.name}</p>
              <p className="text-body-sm font-medium text-foreground">{destination.name}</p>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-caption text-muted-foreground">
            <span>
              {formatDistance(request.distanceKm)} · {formatDuration(request.durationMin)}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" /> {RIDE_CATEGORIES_CONFIG[request.category].capacity}
            </span>
          </div>

          <div className="mt-4 flex items-center justify-between rounded-xl bg-surface px-4 py-3">
            <span className="text-body-sm font-medium text-muted-foreground">Gains estimés</span>
            <span className="font-display text-h3 text-foreground">{formatFare(request.fare)}</span>
          </div>

          {active ? (
            <Button variant="primary" size="lg" className="mt-5 w-full" onClick={onNavigate}>
              <Navigation2 className="h-4 w-4" /> Naviguer
            </Button>
          ) : (
            <div className="mt-5 grid grid-cols-2 gap-3">
              <Button variant="outline" size="lg" onClick={onDecline}>
                Refuser
              </Button>
              <Button variant="primary" size="lg" onClick={onAccept}>
                Accepter
              </Button>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
