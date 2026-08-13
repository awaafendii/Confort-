import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Banknote, CreditCard, Smartphone } from 'lucide-react';
import { Button, IconButton, BottomSheet } from '@/components/ui';
import { MapView, type MapMarkerSpec } from '@/components/map/MapView';
import { RideSummary, PriceBreakdown, PaymentMethodRow, MAP_MARKER_COLORS } from '@/components/business';
import { VehicleSelector } from '@/components/vehicle';
import { usePaymentMethodsStore } from '@/features/payments/paymentMethodsStore';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { CONAKRY_MAP_CENTER, getNeighborhood } from '@/data/neighborhoods';
import { calculateFaresByCategory, calculateRouteEstimate, getNeighborhoodPath, RIDE_CATEGORIES_CONFIG } from '@/data/pricing';
import { formatDistance, formatDuration, formatFare } from '@/utils/format';
import type { PaymentMethod, RideCategory } from '@/types';

const ORIGIN_ID = 'kaloum';

const PAYMENT_ICONS: Record<PaymentMethod, React.ReactNode> = {
  ESPECE: <Banknote className="h-4 w-4" />,
  ORANGE_MONEY: <Smartphone className="h-4 w-4" />,
  MOMO: <Smartphone className="h-4 w-4" />,
  PAYCARD: <CreditCard className="h-4 w-4" />,
  VISA: <CreditCard className="h-4 w-4" />,
  KULU: <CreditCard className="h-4 w-4" />,
};

export default function BookingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isDesktop = useIsDesktop();
  const destinationId = (location.state as { destinationId?: string } | null)?.destinationId;

  const paymentMethods = usePaymentMethodsStore((s) => s.methods);
  const [category, setCategory] = useState<RideCategory>('STANDARD');
  const [paymentId, setPaymentId] = useState<string>('');

  useEffect(() => {
    if (!destinationId) navigate('/passenger', { replace: true });
  }, [destinationId, navigate]);

  useEffect(() => {
    if (!paymentId && paymentMethods.length > 0) {
      setPaymentId(paymentMethods.find((m) => m.isDefault)?.id ?? paymentMethods[0].id);
    }
  }, [paymentId, paymentMethods]);

  const fares = useMemo(() => (destinationId ? calculateFaresByCategory(ORIGIN_ID, destinationId) : null), [destinationId]);
  const estimate = useMemo(
    () => (destinationId ? calculateRouteEstimate(ORIGIN_ID, destinationId, category) : null),
    [destinationId, category]
  );
  const routeCoords = useMemo(() => {
    if (!destinationId) return [];
    return getNeighborhoodPath(ORIGIN_ID, destinationId)
      .map((id) => getNeighborhood(id)?.coords)
      .filter((c): c is { lat: number; lng: number } => !!c);
  }, [destinationId]);

  if (!destinationId || !fares || !estimate) return null;

  const origin = getNeighborhood(ORIGIN_ID)!;
  const destination = getNeighborhood(destinationId)!;

  const markers: MapMarkerSpec[] = [
    { id: 'pickup', kind: 'pin', position: origin.coords, color: MAP_MARKER_COLORS.pickup },
    { id: 'destination', kind: 'pin', position: destination.coords, color: MAP_MARKER_COLORS.destination },
  ];

  const selectedPayment = paymentMethods.find((m) => m.id === paymentId);

  const confirm = () => {
    navigate('/passenger/booking/confirm', {
      state: { destinationId, category, paymentMethod: selectedPayment?.method ?? 'ESPECE' },
    });
  };

  const routeSummary = (
    <div>
      <RideSummary
        pickup={{ label: origin.name, address: `${origin.name}, Conakry`, coords: origin.coords }}
        destination={{ label: destination.name, address: `${destination.name}, Conakry`, coords: destination.coords }}
      />
      <p className="mt-3 pl-[1.375rem] text-body-sm text-muted-foreground">
        {formatDistance(estimate.distanceKm)} · {formatDuration(estimate.durationMin)}
      </p>
    </div>
  );

  const categoryEtas = Object.fromEntries(
    (Object.keys(RIDE_CATEGORIES_CONFIG) as RideCategory[]).map((cat) => [
      cat,
      formatDuration(calculateRouteEstimate(ORIGIN_ID, destinationId, cat).durationMin),
    ])
  ) as Record<RideCategory, string>;

  const rideOptions = (
    <div>
      <p className="mb-2 text-body-sm font-medium text-foreground">Catégorie de course</p>
      <VehicleSelector prices={fares} etas={categoryEtas} value={category} onChange={setCategory} />
    </div>
  );

  const priceBreakdown = (
    <PriceBreakdown items={[{ label: RIDE_CATEGORIES_CONFIG[category].label, amount: fares[category] }]} total={fares[category]} />
  );

  const paymentSection = (
    <div>
      <p className="mb-2 text-body-sm font-medium text-foreground">Paiement</p>
      <div role="radiogroup" aria-label="Moyen de paiement" className="space-y-2">
        {paymentMethods.map((m) => (
          <PaymentMethodRow key={m.id} method={m} icon={PAYMENT_ICONS[m.method]} selected={paymentId === m.id} onSelect={() => setPaymentId(m.id)} />
        ))}
      </div>
    </div>
  );

  const cta = (
    <Button variant="primary" size="lg" className="w-full" onClick={confirm}>
      Choisir {RIDE_CATEGORIES_CONFIG[category].label} — {formatFare(fares[category])}
    </Button>
  );

  if (isDesktop) {
    return (
      <div className="flex h-screen w-full">
        <div className="flex w-[440px] shrink-0 flex-col gap-6 overflow-y-auto border-r border-border p-6">
          <div className="flex items-center gap-3">
            <IconButton icon={<ArrowLeft className="h-5 w-5" />} aria-label="Retour" variant="outline" onClick={() => navigate(-1)} />
            <p className="font-display text-h3 text-foreground">Votre course</p>
          </div>
          {routeSummary}
          {rideOptions}
          {priceBreakdown}
          {paymentSection}
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

      <BottomSheet open inline className="max-h-[80vh]">
        <div className="max-h-[46vh] space-y-5 overflow-y-auto pr-0.5">
          {routeSummary}
          {rideOptions}
          {priceBreakdown}
          {paymentSection}
        </div>
        <div className="mt-4">{cta}</div>
      </BottomSheet>
    </div>
  );
}
