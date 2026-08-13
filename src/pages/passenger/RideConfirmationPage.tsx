import React, { useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Snowflake, Timer, Users } from 'lucide-react';
import { Button, IconButton, BottomSheet } from '@/components/ui';
import { MapView, type MapMarkerSpec } from '@/components/map/MapView';
import { RideSummary, MAP_MARKER_COLORS } from '@/components/business';
import { VEHICLE_CATALOG } from '@/data/vehicles';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { CONAKRY_MAP_CENTER, getNeighborhood } from '@/data/neighborhoods';
import { calculateFaresByCategory, calculateRouteEstimate, getNeighborhoodPath, RIDE_CATEGORIES_CONFIG } from '@/data/pricing';
import { formatFare } from '@/utils/format';
import type { PaymentMethod, RideCategory } from '@/types';

const ORIGIN_ID = 'kaloum';

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  ESPECE: 'Espèces',
  ORANGE_MONEY: 'Orange Money',
  MOMO: 'MoMo',
  PAYCARD: 'Carte',
  VISA: 'Carte bancaire',
  KULU: 'Kulu',
};

interface ConfirmState {
  destinationId?: string;
  category?: RideCategory;
  paymentMethod?: PaymentMethod;
}

/** Écran de confirmation dédié (image de référence) inséré entre BookingPage (sélection) et MatchingPage (mise en relation) — recalcule le tarif localement comme ses deux voisins, ne fait pas transiter de valeur précalculée par le state. */
export default function RideConfirmationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isDesktop = useIsDesktop();
  const { destinationId, category, paymentMethod } = (location.state as ConfirmState | null) ?? {};

  useEffect(() => {
    if (!destinationId || !category) navigate('/passenger', { replace: true });
  }, [destinationId, category, navigate]);

  const fare = useMemo(
    () => (destinationId && category ? calculateFaresByCategory(ORIGIN_ID, destinationId)[category] : 0),
    [destinationId, category]
  );
  const estimate = useMemo(
    () => (destinationId && category ? calculateRouteEstimate(ORIGIN_ID, destinationId, category) : null),
    [destinationId, category]
  );
  const routeCoords = useMemo(() => {
    if (!destinationId) return [];
    return getNeighborhoodPath(ORIGIN_ID, destinationId)
      .map((id) => getNeighborhood(id)?.coords)
      .filter((c): c is { lat: number; lng: number } => !!c);
  }, [destinationId]);

  if (!destinationId || !category || !estimate) return null;

  const origin = getNeighborhood(ORIGIN_ID)!;
  const destination = getNeighborhood(destinationId)!;
  const vehicle = VEHICLE_CATALOG[category];

  const markers: MapMarkerSpec[] = [
    { id: 'pickup', kind: 'pin', position: origin.coords, color: MAP_MARKER_COLORS.pickup },
    { id: 'destination', kind: 'pin', position: destination.coords, color: MAP_MARKER_COLORS.destination },
  ];

  const confirm = () => {
    navigate('/passenger/booking/matching', { state: { destinationId, category, paymentMethod } });
  };

  const content = (
    <div className="space-y-5">
      <img
        src={vehicle.image}
        alt={vehicle.name}
        className="mx-auto h-32 w-auto object-contain sm:h-40"
        loading="lazy"
      />
      <div>
        <p className="font-display text-h2 text-foreground">{vehicle.name}</p>
        <p className="mt-1 text-body-sm text-muted-foreground">{vehicle.description}</p>
      </div>

      <div className="grid grid-cols-3 gap-2 rounded-lg border border-border bg-surface p-3 text-center">
        <div>
          <Timer className="mx-auto h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <p className="mt-1 text-body-sm font-semibold text-foreground">{estimate.durationMin} min</p>
          <p className="text-caption text-muted-foreground">Arrivée</p>
        </div>
        <div className="border-x border-border">
          <Users className="mx-auto h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <p className="mt-1 text-body-sm font-semibold text-foreground">{RIDE_CATEGORIES_CONFIG[category].capacity}</p>
          <p className="text-caption text-muted-foreground">Passagers</p>
        </div>
        <div>
          {/* Aucune donnée "climatisation" dans le modèle véhicule aujourd'hui — puce statique, cosmétique. */}
          <Snowflake className="mx-auto h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <p className="mt-1 text-body-sm font-semibold text-foreground">Climatisé</p>
        </div>
      </div>

      <RideSummary
        pickup={{ label: origin.name, address: `${origin.name}, Conakry`, coords: origin.coords }}
        destination={{ label: destination.name, address: `${destination.name}, Conakry`, coords: destination.coords }}
      />

      <div className="border-t border-border pt-4">
        <p className="text-body-sm text-muted-foreground">Tarif estimé</p>
        <p className="font-display text-h1 text-foreground">{formatFare(fare)}</p>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-border bg-surface p-4 text-body-sm">
        <span className="text-muted-foreground">Paiement</span>
        <span className="font-medium text-foreground">{PAYMENT_LABELS[paymentMethod ?? 'ESPECE']}</span>
      </div>
    </div>
  );

  const cta = (
    <Button variant="primary" size="lg" className="w-full" onClick={confirm}>
      Confirmer la course
    </Button>
  );

  if (isDesktop) {
    return (
      <div className="flex h-screen w-full">
        <div className="flex w-[440px] shrink-0 flex-col gap-6 overflow-y-auto border-r border-border p-6">
          <div className="flex items-center gap-3">
            <IconButton icon={<ArrowLeft className="h-5 w-5" />} aria-label="Retour" variant="outline" onClick={() => navigate(-1)} />
            <p className="font-display text-h3 text-foreground">Choisissez votre course</p>
          </div>
          {content}
          {cta}
        </div>
        <div className="relative flex-1">
          <MapView center={CONAKRY_MAP_CENTER} zoom={12.5} markers={markers} route={routeCoords} className="h-full w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <div className="absolute inset-0">
        <MapView center={CONAKRY_MAP_CENTER} zoom={12.5} markers={markers} route={routeCoords} className="h-full w-full" />
      </div>
      <IconButton
        icon={<ArrowLeft className="h-5 w-5" />}
        aria-label="Retour"
        onClick={() => navigate(-1)}
        className="absolute left-4 z-10 bg-surface/95 shadow-card backdrop-blur hover:bg-surface top-[max(1rem,env(safe-area-inset-top))]"
      />

      <BottomSheet open inline className="max-h-[85vh]">
        <div className="max-h-[62vh] overflow-y-auto pr-0.5">{content}</div>
        <div className="mt-4">{cta}</div>
      </BottomSheet>
    </div>
  );
}
