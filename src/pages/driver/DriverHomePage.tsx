import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Bike, Car, Navigation2, Star, TrendingUp, Users, Wallet } from 'lucide-react';
import { Avatar, Badge, Button, Card, StatCard, toast } from '@/components/ui';
import { MapView, type MapMarkerSpec } from '@/components/map/MapView';
import { useAuthStore } from '@/features/auth/store';
import { useDriverSessionStore } from '@/features/drivers/driverSessionStore';
import { generateRideRequest, type RideRequest } from '@/features/drivers/rideRequestSimulator';
import { getNeighborhood, CONAKRY_MAP_CENTER } from '@/data/neighborhoods';
import { NEARBY_VEHICLE_MARKERS } from '@/data/nearbyVehicleMarkers';
import { RIDE_CATEGORIES_CONFIG } from '@/data/pricing';
import { VEHICLE_COLORS } from '@/data/vehicleColors';
import { formatDistance, formatDuration, formatFare } from '@/utils/format';
import type { Driver } from '@/types';
import { cn } from '@/lib/utils';

const REQUEST_INTERVAL_MS = 5000;
const COUNTDOWN_MS = 15000;

type RequestState = 'idle' | 'incoming' | 'active';

export default function DriverHomePage() {
  const navigate = useNavigate();
  const account = useAuthStore((s) => s.account) as Driver | null;
  const updateAccount = useAuthStore((s) => s.updateAccount);
  const tripsToday = useDriverSessionStore((s) => s.tripsToday);

  const [requestState, setRequestState] = useState<RequestState>('idle');
  const [currentRequest, setCurrentRequest] = useState<RideRequest | null>(null);

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

  if (!account) return null;

  const toggleOnline = () => {
    const next = isOnline ? 'OFFLINE' : 'ONLINE';
    updateAccount({ status: next });
    if (next === 'OFFLINE') {
      setRequestState('idle');
      setCurrentRequest(null);
    }
  };

  const decline = (auto = false) => {
    setCurrentRequest(null);
    setRequestState('idle');
    toast(auto ? 'Course expirée — non attribuée.' : 'Course refusée.');
  };

  const accept = () => setRequestState('active');

  const navigateToRide = () => {
    if (!currentRequest) return;
    navigate('/driver/tracking', { state: { request: currentRequest } });
  };

  return (
    <div className="mx-auto max-w-md px-5 pb-10 pt-8 lg:max-w-2xl lg:px-8">
      <Card className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={cn('h-2.5 w-2.5 rounded-full', isOnline ? 'bg-secondary-600' : 'bg-muted-foreground')} />
          <div>
            <p className="text-sm font-semibold text-foreground">{isOnline ? 'En ligne' : 'Hors ligne'}</p>
            <p className="text-xs text-muted-foreground">{isOnline ? 'Vous recevez des courses' : 'Passez en ligne pour recevoir des courses'}</p>
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
                <p className="text-sm font-semibold text-foreground">
                  {isOnline ? 'En attente de courses...' : 'Vous êtes hors ligne'}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {isOnline
                    ? 'Une nouvelle demande apparaîtra automatiquement ici (simulation de démonstration).'
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
            onAccept={accept}
            onDecline={() => decline(false)}
            onNavigate={navigateToRide}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function RequestCard({
  request,
  active,
  onAccept,
  onDecline,
  onNavigate,
}: {
  request: RideRequest;
  active: boolean;
  onAccept: () => void;
  onDecline: () => void;
  onNavigate: () => void;
}) {
  const pickup = getNeighborhood(request.pickupId)!;
  const destination = getNeighborhood(request.destinationId)!;
  const isMoto = request.category === 'MOTO_SINGLE';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card noPadding className="overflow-hidden">
        {!active && (
          <div className="h-1 w-full bg-surface">
            <motion.div
              className="h-full bg-primary-700"
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 15, ease: 'linear' }}
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
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
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
              <p className="text-sm font-medium text-foreground">{pickup.name}</p>
              <p className="text-sm font-medium text-foreground">{destination.name}</p>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {formatDistance(request.distanceKm)} · {formatDuration(request.durationMin)}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" /> {RIDE_CATEGORIES_CONFIG[request.category].capacity}
            </span>
          </div>

          <div className="mt-4 flex items-center justify-between rounded-xl bg-surface px-4 py-3">
            <span className="text-sm font-medium text-muted-foreground">Gains estimés</span>
            <span className="font-display text-lg font-bold text-foreground">{formatFare(request.fare)}</span>
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
