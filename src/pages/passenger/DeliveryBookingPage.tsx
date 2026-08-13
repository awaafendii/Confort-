import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Banknote, Bike, CreditCard, Package, Smartphone, Truck } from 'lucide-react';
import { Button, IconButton, BottomSheet, Input, SegmentedControl, Textarea } from '@/components/ui';
import { MapView, type MapMarkerSpec } from '@/components/map/MapView';
import { RideSummary, PriceBreakdown, PaymentMethodRow, MAP_MARKER_COLORS } from '@/components/business';
import { usePaymentMethodsStore } from '@/features/payments/paymentMethodsStore';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { CONAKRY_MAP_CENTER, getNeighborhood } from '@/data/neighborhoods';
import { getNeighborhoodPath } from '@/data/pricing';
import { DELIVERY_MODES_CONFIG, PACKAGE_SIZE_CONFIG, calculateDeliveryEstimate, calculateDeliveryFaresByMode } from '@/data/deliveryPricing';
import { formatDistance, formatDuration, formatFare } from '@/utils/format';
import type { DeliveryMode, PackageSize, PaymentMethod } from '@/types';

const PICKUP_ID = 'kaloum';

const PAYMENT_ICONS: Record<PaymentMethod, React.ReactNode> = {
  ESPECE: <Banknote className="h-4 w-4" />,
  ORANGE_MONEY: <Smartphone className="h-4 w-4" />,
  MOMO: <Smartphone className="h-4 w-4" />,
  PAYCARD: <CreditCard className="h-4 w-4" />,
  VISA: <CreditCard className="h-4 w-4" />,
  KULU: <CreditCard className="h-4 w-4" />,
};

const MODE_OPTIONS = (Object.keys(DELIVERY_MODES_CONFIG) as DeliveryMode[]).map((mode) => ({
  value: mode,
  label: DELIVERY_MODES_CONFIG[mode].label,
  icon: mode === 'EXPRESS_MOTO' ? <Bike className="h-4 w-4" /> : <Truck className="h-4 w-4" />,
}));

const SIZE_OPTIONS = (Object.keys(PACKAGE_SIZE_CONFIG) as PackageSize[]).map((size) => ({
  value: size,
  label: PACKAGE_SIZE_CONFIG[size].label,
}));

export default function DeliveryBookingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isDesktop = useIsDesktop();
  const dropoffId = (location.state as { dropoffId?: string } | null)?.dropoffId;

  const paymentMethods = usePaymentMethodsStore((s) => s.methods);
  const [mode, setMode] = useState<DeliveryMode>('EXPRESS_MOTO');
  const [packageSize, setPackageSize] = useState<PackageSize>('SMALL');
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [note, setNote] = useState('');
  const [paymentId, setPaymentId] = useState<string>('');

  useEffect(() => {
    if (!dropoffId) navigate('/passenger', { replace: true });
  }, [dropoffId, navigate]);

  useEffect(() => {
    if (!paymentId && paymentMethods.length > 0) {
      setPaymentId(paymentMethods.find((m) => m.isDefault)?.id ?? paymentMethods[0].id);
    }
  }, [paymentId, paymentMethods]);

  const fares = useMemo(
    () => (dropoffId ? calculateDeliveryFaresByMode(PICKUP_ID, dropoffId, packageSize) : null),
    [dropoffId, packageSize]
  );
  const estimate = useMemo(() => (dropoffId ? calculateDeliveryEstimate(PICKUP_ID, dropoffId, mode) : null), [dropoffId, mode]);
  const routeCoords = useMemo(() => {
    if (!dropoffId) return [];
    return getNeighborhoodPath(PICKUP_ID, dropoffId)
      .map((id) => getNeighborhood(id)?.coords)
      .filter((c): c is { lat: number; lng: number } => !!c);
  }, [dropoffId]);

  if (!dropoffId || !fares || !estimate) return null;

  const pickup = getNeighborhood(PICKUP_ID)!;
  const dropoff = getNeighborhood(dropoffId)!;

  const markers: MapMarkerSpec[] = [
    { id: 'pickup', kind: 'pin', position: pickup.coords, color: MAP_MARKER_COLORS.pickup },
    { id: 'dropoff', kind: 'pin', position: dropoff.coords, color: MAP_MARKER_COLORS.destination },
  ];

  const selectedPayment = paymentMethods.find((m) => m.id === paymentId);
  const canConfirm = recipientName.trim().length > 0 && recipientPhone.trim().length > 0;

  const confirm = () => {
    if (!canConfirm) return;
    navigate('/passenger/delivery/booking/matching', {
      state: {
        dropoffId,
        mode,
        packageSize,
        recipientName: recipientName.trim(),
        recipientPhone: recipientPhone.trim(),
        note: note.trim() || undefined,
        paymentMethod: selectedPayment?.method ?? 'ESPECE',
      },
    });
  };

  const routeSummary = (
    <div>
      <RideSummary
        pickup={{ label: pickup.name, address: `${pickup.name}, Conakry`, coords: pickup.coords }}
        destination={{ label: dropoff.name, address: `${dropoff.name}, Conakry`, coords: dropoff.coords }}
      />
      <p className="mt-3 pl-[1.375rem] text-body-sm text-muted-foreground">
        {formatDistance(estimate.distanceKm)} · {formatDuration(estimate.durationMin)}
      </p>
    </div>
  );

  const modeSection = (
    <div>
      <p className="mb-2 text-body-sm font-medium text-foreground">Mode de livraison</p>
      <SegmentedControl options={MODE_OPTIONS} value={mode} onChange={setMode} label="Mode de livraison" className="w-full" />
      <p className="mt-1.5 text-caption text-muted-foreground">{DELIVERY_MODES_CONFIG[mode].description}</p>
    </div>
  );

  const sizeSection = (
    <div>
      <p className="mb-2 text-body-sm font-medium text-foreground">Taille du colis</p>
      <SegmentedControl options={SIZE_OPTIONS} value={packageSize} onChange={setPackageSize} label="Taille du colis" className="w-full" />
      <p className="mt-1.5 text-caption text-muted-foreground">{PACKAGE_SIZE_CONFIG[packageSize].description}</p>
    </div>
  );

  const recipientSection = (
    <div className="space-y-3">
      <p className="text-body-sm font-medium text-foreground">Destinataire</p>
      <Input placeholder="Nom du destinataire" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} icon={<Package className="h-4 w-4" />} />
      <Input type="tel" placeholder="Téléphone du destinataire" value={recipientPhone} onChange={(e) => setRecipientPhone(e.target.value)} />
      <Textarea placeholder="Note pour le livreur (optionnel)" value={note} onChange={(e) => setNote(e.target.value)} rows={2} />
    </div>
  );

  const priceBreakdown = (
    <PriceBreakdown
      items={[
        { label: DELIVERY_MODES_CONFIG[mode].label, amount: fares[mode] - PACKAGE_SIZE_CONFIG[packageSize].surcharge },
        ...(PACKAGE_SIZE_CONFIG[packageSize].surcharge > 0
          ? [{ label: `Supplément — ${PACKAGE_SIZE_CONFIG[packageSize].label.toLowerCase()}`, amount: PACKAGE_SIZE_CONFIG[packageSize].surcharge }]
          : []),
      ]}
      total={fares[mode]}
    />
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
    <Button variant="primary" size="lg" className="w-full" onClick={confirm} disabled={!canConfirm}>
      Confirmer la livraison — {formatFare(fares[mode])}
    </Button>
  );

  if (isDesktop) {
    return (
      <div className="flex h-screen w-full">
        <div className="flex w-[440px] shrink-0 flex-col gap-6 overflow-y-auto border-r border-border p-6">
          <div className="flex items-center gap-3">
            <IconButton icon={<ArrowLeft className="h-5 w-5" />} aria-label="Retour" variant="outline" onClick={() => navigate(-1)} />
            <p className="font-display text-h3 text-foreground">Votre livraison</p>
          </div>
          {routeSummary}
          {modeSection}
          {sizeSection}
          {recipientSection}
          {priceBreakdown}
          {paymentSection}
          {cta}
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
        <MapView center={CONAKRY_MAP_CENTER} zoom={12.5} markers={markers} route={routeCoords} interactive={false} className="h-full w-full" />
      </div>
      <IconButton
        icon={<ArrowLeft className="h-5 w-5" />}
        aria-label="Retour"
        onClick={() => navigate(-1)}
        className="absolute left-4 top-4 z-10 bg-surface/95 shadow-card backdrop-blur hover:bg-surface"
      />

      <BottomSheet open inline className="max-h-[85vh]">
        <div className="max-h-[52vh] space-y-5 overflow-y-auto pr-0.5">
          {routeSummary}
          {modeSection}
          {sizeSection}
          {recipientSection}
          {priceBreakdown}
          {paymentSection}
        </div>
        <div className="mt-4">{cta}</div>
      </BottomSheet>
    </div>
  );
}
