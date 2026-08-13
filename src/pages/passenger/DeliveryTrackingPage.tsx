import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, MapPin, MessageCircle, Navigation2, Package, Phone, Share2, ShieldCheck } from 'lucide-react';
import { Badge, type BadgeProps, BottomSheet, IconButton, Modal, toast } from '@/components/ui';
import { DriverCard, SafetyPanel, MAP_MARKER_COLORS } from '@/components/business';
import { MapView } from '@/components/map/MapView';
import { getNeighborhood } from '@/data/neighborhoods';
import { getNeighborhoodPath } from '@/data/pricing';
import { DELIVERY_MODES_CONFIG, PACKAGE_SIZE_CONFIG, calculateDeliveryEstimate, calculateDeliveryFare } from '@/data/deliveryPricing';
import { VEHICLE_COLORS } from '@/data/vehicleColors';
import { useAuthStore } from '@/features/auth/store';
import { useNotificationsStore } from '@/features/notifications/notificationsStore';
import { useTripSimulation } from '@/features/rides/useTripSimulation';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';
import type { DeliveryMode, Driver, PackageSize, PaymentMethod } from '@/types';

const PICKUP_ID = 'kaloum';

interface DeliveryTrackingState {
  dropoffId?: string;
  mode?: DeliveryMode;
  packageSize?: PackageSize;
  recipientName?: string;
  recipientPhone?: string;
  note?: string;
  paymentMethod?: PaymentMethod;
  driver?: Driver;
}

/** Mêmes statuts que le suivi de course (TrackingPage.tsx) — vocabulaire "livreur" seulement. */
const STATUS_CONFIG: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; badge: NonNullable<BadgeProps['variant']> }> = {
  DRIVER_ASSIGNED: { label: 'Livreur en route vers le point de collecte', icon: Package, badge: 'primary' },
  DRIVER_ARRIVING: { label: 'Livreur bientôt à la collecte', icon: Package, badge: 'warning' },
  DRIVER_ARRIVED: { label: 'Colis récupéré par le livreur', icon: MapPin, badge: 'accent' },
  IN_PROGRESS: { label: 'Livraison en cours', icon: Navigation2, badge: 'primary' },
  COMPLETED: { label: 'Livraison terminée', icon: CheckCircle2, badge: 'success' },
};

function ActionButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <IconButton icon={icon} aria-label={label} variant="outline" onClick={onClick} />
      <span className="text-caption font-medium text-muted-foreground">{label}</span>
    </div>
  );
}

export default function DeliveryTrackingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const account = useAuthStore((s) => s.account);
  const addNotification = useNotificationsStore((s) => s.addNotification);
  const isDesktop = useIsDesktop();
  const { dropoffId, mode, packageSize, recipientName, recipientPhone, note, paymentMethod, driver } =
    (location.state as DeliveryTrackingState | null) ?? {};
  const [safetyOpen, setSafetyOpen] = useState(false);

  useEffect(() => {
    if (!dropoffId || !mode || !packageSize || !driver) navigate('/passenger', { replace: true });
  }, [dropoffId, mode, packageSize, driver, navigate]);

  const pickup = getNeighborhood(PICKUP_ID);
  const dropoff = dropoffId ? getNeighborhood(dropoffId) : undefined;

  const toDropoffPath = useMemo(
    () => (dropoffId ? getNeighborhoodPath(PICKUP_ID, dropoffId).map((id) => getNeighborhood(id)!.coords) : []),
    [dropoffId]
  );
  const toPickupPath = useMemo(() => {
    if (!pickup) return [];
    const jitterLat = pickup.coords.lat + 0.012;
    const jitterLng = pickup.coords.lng - 0.01;
    return [{ lat: jitterLat, lng: jitterLng }, pickup.coords];
  }, [pickup]);

  const estimate = dropoffId && mode ? calculateDeliveryEstimate(PICKUP_ID, dropoffId, mode) : null;

  const sim = useTripSimulation({
    toPickupPath: toPickupPath.length ? toPickupPath : [{ lat: 0, lng: 0 }, { lat: 0, lng: 0 }],
    toDestinationPath: toDropoffPath.length ? toDropoffPath : [{ lat: 0, lng: 0 }, { lat: 0, lng: 0 }],
    estimatedTotalMin: estimate?.durationMin ?? 8,
    onComplete: () => {
      if (!dropoffId || !mode || !packageSize || !driver || !dropoff || !pickup) return;
      if (account) {
        addNotification({
          userId: account.id,
          type: 'RIDE',
          title: 'Livraison terminée',
          body: `Votre colis est arrivé à ${dropoff.name} avec ${driver.name.split(' ')[0]}.`,
        });
      }
      navigate('/passenger/delivery/completed', {
        replace: true,
        state: {
          driver,
          mode,
          packageSize,
          recipientName,
          recipientPhone,
          note,
          paymentMethod: paymentMethod ?? 'ESPECE',
          pickup: { label: pickup.name, address: `${pickup.name}, Conakry`, coords: pickup.coords },
          dropoff: { label: dropoff.name, address: `${dropoff.name}, Conakry`, coords: dropoff.coords },
          distanceKm: estimate?.distanceKm ?? 0,
          durationMin: estimate?.durationMin ?? 0,
          fare: calculateDeliveryFare(PICKUP_ID, dropoffId, mode, packageSize),
        },
      });
    },
  });

  if (!dropoffId || !mode || !packageSize || !driver || !dropoff || !pickup) return null;

  const color = VEHICLE_COLORS[driver.vehicle.color];
  const fullRoute = [...toPickupPath, ...toDropoffPath.slice(1)];
  const canCancel = sim.status === 'DRIVER_ASSIGNED' || sim.status === 'DRIVER_ARRIVING';
  const statusInfo = STATUS_CONFIG[sim.status] ?? { label: sim.status, icon: Package, badge: 'neutral' as const };
  const StatusIcon = statusInfo.icon;

  const cancel = () => {
    toast('Livraison annulée.');
    navigate('/passenger', { replace: true });
  };

  const shareTrip = async () => {
    const text = `Un colis est en route vers ${dropoff.name} avec Confort+, livré par ${driver.name}.`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Ma livraison Confort+', text });
      } catch {
        // L'utilisateur a annulé la boîte de partage native — rien à signaler.
      }
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      toast.success('Détails de la livraison copiés.');
    } else {
      toast('Partage indisponible sur cet appareil.');
    }
  };
  const contactSupport = () => navigate('/passenger/profile/help');
  const reportIssue = () => {
    setSafetyOpen(false);
    toast.success('Signalement envoyé à notre équipe.');
  };
  const triggerSOS = () => {
    setSafetyOpen(false);
    toast.error('SOS activé — alerte enregistrée.');
  };

  const map = (
    <MapView
      center={pickup.coords}
      zoom={13}
      route={fullRoute}
      markers={[
        { id: 'pickup', kind: 'pin', position: pickup.coords, color: MAP_MARKER_COLORS.pickup },
        { id: 'dropoff', kind: 'pin', position: dropoff.coords, color: MAP_MARKER_COLORS.destination },
        { id: 'courier', kind: 'vehicle', position: sim.position, color: color.hex, vehicleType: driver.vehicle.type, rotation: sim.heading },
      ]}
      className="h-full w-full"
    />
  );

  const statusPill = (
    <div aria-live="polite" className="pointer-events-none absolute inset-x-0 top-0 flex justify-center px-4 pt-[max(1rem,env(safe-area-inset-top))]">
      <Badge variant={statusInfo.badge} className="gap-2 px-4 py-2 text-body-sm shadow-elevated backdrop-blur">
        <StatusIcon className="h-4 w-4" aria-hidden="true" />
        {statusInfo.label}
      </Badge>
    </div>
  );

  const tripInfo = (
    <>
      <div className="mb-3 flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-800">
          <Package className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="flex flex-1 items-center justify-between">
          <Badge variant="neutral">
            {DELIVERY_MODES_CONFIG[mode].label} · {PACKAGE_SIZE_CONFIG[packageSize].label}
          </Badge>
          <span className="text-body-sm font-semibold text-foreground">
            {sim.status === 'COMPLETED' || sim.status === 'DRIVER_ARRIVED' ? 'Arrivé' : `${sim.etaMin} min`}
          </span>
        </div>
      </div>

      <DriverCard driver={driver} eta={sim.status === 'DRIVER_ARRIVED' ? 'Arrivé' : `${sim.etaMin} min`} />

      <div className="mt-3 flex items-center justify-between rounded-lg bg-surface px-3.5 py-2.5 text-body-sm">
        <span className="text-muted-foreground">Destinataire</span>
        <span className="font-medium text-foreground">{recipientName ?? dropoff.name}</span>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2">
        <ActionButton icon={<Phone className="h-5 w-5" />} label="Appeler" onClick={() => (window.location.href = `tel:${driver.phone}`)} />
        <ActionButton
          icon={<MessageCircle className="h-5 w-5" />}
          label="Chat"
          onClick={() =>
            navigate('/passenger/chat', {
              state: { rideId: driver.id, myRole: 'PASSENGER', otherName: driver.name, otherAvatar: driver.avatar, otherPhone: driver.phone },
            })
          }
        />
        <ActionButton icon={<Share2 className="h-5 w-5" />} label="Partager" onClick={shareTrip} />
        <ActionButton icon={<ShieldCheck className="h-5 w-5" />} label="Sécurité" onClick={() => setSafetyOpen(true)} />
      </div>

      {canCancel && (
        <button
          type="button"
          onClick={cancel}
          className={cn(
            'mt-4 flex h-12 w-full items-center justify-center rounded-md text-button text-danger transition-colors hover:bg-danger/10',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger focus-visible:ring-offset-2'
          )}
        >
          Annuler la livraison
        </button>
      )}
    </>
  );

  const safetyModal = (
    <Modal open={safetyOpen} onClose={() => setSafetyOpen(false)} title="Sécurité">
      <SafetyPanel
        onShareTrip={() => {
          setSafetyOpen(false);
          shareTrip();
        }}
        onCallDriver={() => (window.location.href = `tel:${driver.phone}`)}
        onContactSupport={contactSupport}
        onReportIssue={reportIssue}
        onSOS={triggerSOS}
      />
    </Modal>
  );

  if (isDesktop) {
    return (
      <div className="flex h-screen w-full">
        <div className="flex w-[420px] shrink-0 flex-col overflow-y-auto border-r border-border p-6">
          <p className="mb-4 font-display text-h3 text-foreground">Suivi de livraison</p>
          {tripInfo}
        </div>
        <div className="relative flex-1">
          {map}
          {statusPill}
        </div>
        {safetyModal}
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-background">
      <div className="absolute inset-0">{map}</div>
      {statusPill}
      <BottomSheet open inline className="max-h-[70vh] overflow-y-auto">
        {tripInfo}
      </BottomSheet>
      {safetyModal}
    </div>
  );
}
