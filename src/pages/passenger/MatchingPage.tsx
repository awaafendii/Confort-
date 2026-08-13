import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Car, MessageCircle, Navigation2, Phone } from 'lucide-react';
import { Badge, Button, BottomSheet, ErrorState, IconButton, toast } from '@/components/ui';
import { DriverCard, MAP_MARKER_COLORS } from '@/components/business';
import { MapView, type MapMarkerSpec } from '@/components/map/MapView';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { CONAKRY_MAP_CENTER, getNeighborhood } from '@/data/neighborhoods';
import { calculateFaresByCategory, getNeighborhoodPath, RIDE_CATEGORIES_CONFIG } from '@/data/pricing';
import { pickDriverFor } from '@/data/mockDrivers';
import { VEHICLE_CATALOG } from '@/data/vehicles';
import { VEHICLE_COLORS } from '@/data/vehicleColors';
import { formatFare } from '@/utils/format';
import type { Driver, PaymentMethod, RideCategory } from '@/types';

const ORIGIN_ID = 'kaloum';
/** Probabilité simulée d'échec de matching — permet à l'état Error d'être réellement atteignable en démonstration. */
const NO_DRIVER_CHANCE = 0.12;

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  ESPECE: 'Espèces',
  ORANGE_MONEY: 'Orange Money',
  MOMO: 'MoMo',
  PAYCARD: 'Carte',
  VISA: 'Carte bancaire',
  KULU: 'Kulu',
};

interface MatchState {
  destinationId?: string;
  category?: RideCategory;
  paymentMethod?: PaymentMethod;
}

type MatchStatus = 'searching' | 'error' | 'found';

export default function MatchingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isDesktop = useIsDesktop();
  const { destinationId, category, paymentMethod } = (location.state as MatchState | null) ?? {};

  const [status, setStatus] = useState<MatchStatus>('searching');
  const [match, setMatch] = useState<{ driver: Driver; etaMin: number } | null>(null);
  const [attempt, setAttempt] = useState(0);

  const runMatch = useCallback(() => {
    if (!category) return;
    if (Math.random() < NO_DRIVER_CHANCE) {
      setStatus('error');
      setMatch(null);
    } else {
      setMatch(pickDriverFor(category));
      setStatus('found');
    }
  }, [category]);

  useEffect(() => {
    if (!destinationId || !category) {
      navigate('/passenger', { replace: true });
      return;
    }
    setStatus('searching');
    const timeout = setTimeout(runMatch, 2200);
    return () => clearTimeout(timeout);
  }, [destinationId, category, navigate, attempt, runMatch]);

  const fare = useMemo(
    () => (destinationId && category ? calculateFaresByCategory(ORIGIN_ID, destinationId)[category] : 0),
    [destinationId, category]
  );
  const routeCoords = useMemo(() => {
    if (!destinationId) return [];
    return getNeighborhoodPath(ORIGIN_ID, destinationId)
      .map((id) => getNeighborhood(id)?.coords)
      .filter((c): c is { lat: number; lng: number } => !!c);
  }, [destinationId]);

  if (!destinationId || !category) return null;

  const destination = getNeighborhood(destinationId)!;
  const origin = getNeighborhood(ORIGIN_ID)!;

  const cancel = () => {
    toast('Course annulée.');
    navigate('/passenger', { replace: true });
  };
  const retry = () => setAttempt((n) => n + 1);

  const markers: MapMarkerSpec[] = [
    { id: 'pickup', kind: 'pin', position: origin.coords, color: MAP_MARKER_COLORS.pickup },
    { id: 'destination', kind: 'pin', position: destination.coords, color: MAP_MARKER_COLORS.destination },
  ];
  if (status === 'found' && match) {
    // Chauffeur en approche du point de départ — positionné à 12% du trajet depuis l'origine (pas au hasard sur la route entière).
    markers.push({
      id: 'driver',
      kind: 'vehicle',
      position: {
        lat: origin.coords.lat + (destination.coords.lat - origin.coords.lat) * 0.12,
        lng: origin.coords.lng + (destination.coords.lng - origin.coords.lng) * 0.12,
      },
      color: VEHICLE_COLORS[match.driver.vehicle.color].markerHex,
      vehicleType: match.driver.vehicle.type,
    });
  }

  const announcement =
    status === 'searching'
      ? 'Recherche d’un chauffeur en cours.'
      : status === 'error'
        ? 'Aucun chauffeur disponible pour le moment.'
        : `Chauffeur trouvé, arrivée dans ${match?.etaMin} minutes.`;

  const searchingContent = (
    <div className="flex flex-col items-center px-6 py-8 text-center">
      <div className="relative mb-6 flex h-28 w-28 items-center justify-center">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="absolute inset-0 rounded-full border-2 border-primary-200"
            initial={{ scale: 0.4, opacity: 0.6 }}
            animate={{ scale: 1.4, opacity: 0 }}
            transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.5, ease: 'easeOut' }}
          />
        ))}
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-800 text-white">
          <Car className="h-6 w-6" />
        </div>
      </div>
      <p className="font-display text-h3 text-foreground">Recherche de votre chauffeur...</p>
      <p className="mt-2 text-body-sm text-muted-foreground">Direction {destination.name}, Conakry</p>
      <Button variant="outline" size="lg" className="mt-8 w-full max-w-xs" onClick={cancel}>
        Annuler
      </Button>
    </div>
  );

  const errorContent = (
    <div className="px-2 py-4">
      <ErrorState
        title="Aucun chauffeur disponible"
        description="Aucun chauffeur n'a pu être trouvé pour ce trajet. Réessayez dans quelques instants."
        retryLabel="Réessayer"
        onRetry={retry}
      />
      <Button variant="ghost" size="lg" className="w-full text-danger hover:bg-danger/10" onClick={cancel}>
        Annuler
      </Button>
    </div>
  );

  const foundContent = match ? (
    <div className="space-y-3">
      <div className="text-center">
        <img
          src={VEHICLE_CATALOG[category].image}
          alt={VEHICLE_CATALOG[category].name}
          className="mx-auto h-16 w-auto object-contain"
          loading="lazy"
        />
        <Badge variant="accent" className="mb-2 mt-1">
          Chauffeur trouvé
        </Badge>
        <p className="font-display text-h3 text-foreground">Arrive dans {match.etaMin} min</p>
      </div>

      <DriverCard driver={match.driver} eta={`${match.etaMin} min`} className="rounded-lg border border-border bg-surface p-4" />

      <div className="flex items-center justify-between rounded-lg border border-border bg-surface p-4 text-body-sm">
        <span className="text-muted-foreground">Destination</span>
        <span className="font-medium text-foreground">{destination.name}</span>
      </div>
      <div className="flex items-center justify-between rounded-lg border border-border bg-surface p-4 text-body-sm">
        <span className="text-muted-foreground">{PAYMENT_LABELS[paymentMethod ?? 'ESPECE']}</span>
        <span className="font-display text-h3 text-foreground">{formatFare(fare)}</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" onClick={() => (window.location.href = `tel:${match.driver.phone}`)}>
          <Phone className="h-4 w-4" /> Appeler
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            navigate('/passenger/chat', {
              state: {
                rideId: match.driver.id,
                myRole: 'PASSENGER',
                otherName: match.driver.name,
                otherAvatar: match.driver.avatar,
                otherPhone: match.driver.phone,
              },
            })
          }
        >
          <MessageCircle className="h-4 w-4" /> Message
        </Button>
      </div>

      <div className="space-y-2 pt-1">
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={() =>
            navigate('/passenger/tracking', { replace: true, state: { destinationId, category, paymentMethod, driver: match.driver } })
          }
        >
          <Navigation2 className="h-4 w-4" /> Suivre mon chauffeur
        </Button>
        <Button variant="ghost" size="lg" className="w-full text-danger hover:bg-danger/10" onClick={cancel}>
          Annuler la course
        </Button>
      </div>
    </div>
  ) : null;

  const overlayContent = status === 'searching' ? searchingContent : status === 'error' ? errorContent : foundContent;

  if (isDesktop) {
    return (
      <div className="flex h-screen w-full">
        <div className="flex w-[420px] shrink-0 flex-col gap-6 overflow-y-auto border-r border-border p-6">
          <div className="flex items-center gap-3">
            <IconButton icon={<ArrowLeft className="h-5 w-5" />} aria-label="Retour" variant="outline" onClick={cancel} />
            <p className="font-display text-h3 text-foreground">{RIDE_CATEGORIES_CONFIG[category].label}</p>
          </div>
          <div aria-live="polite" className="sr-only">
            {announcement}
          </div>
          {overlayContent}
        </div>
        <div className="relative flex-1">
          <MapView center={CONAKRY_MAP_CENTER} zoom={12.5} markers={markers} route={routeCoords} interactive={false} className="h-full w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <div className="absolute inset-0">
        <MapView center={origin.coords} zoom={13} markers={markers} route={routeCoords} interactive={false} className="h-full w-full" />
      </div>
      <div aria-live="polite" className="sr-only">
        {announcement}
      </div>

      {status === 'found' ? (
        <BottomSheet open inline className="max-h-[82vh] overflow-y-auto">
          {overlayContent}
        </BottomSheet>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="safe-bottom absolute inset-x-0 bottom-0 z-10 rounded-t-xl border-t border-border bg-surface shadow-sheet"
        >
          {overlayContent}
        </motion.div>
      )}
    </div>
  );
}
