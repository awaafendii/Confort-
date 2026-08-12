import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell, Briefcase, Clock, Home, Search } from 'lucide-react';
import { Avatar, Card, Skeleton } from '@/components/ui';
import { MapView } from '@/components/map/MapView';
import { useAuthStore } from '@/features/auth/store';
import { useSavedPlacesStore } from '@/features/profile/savedPlacesStore';
import { useNotificationsStore } from '@/features/notifications/notificationsStore';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { NEIGHBORHOODS, CONAKRY_MAP_CENTER } from '@/data/neighborhoods';
import { NEARBY_VEHICLE_MARKERS } from '@/data/nearbyVehicleMarkers';
import { cn } from '@/lib/utils';
import type { SavedPlace } from '@/types';

/** Fait correspondre un lieu enregistré à un quartier réservable (le graphe tarifaire ne connaît que ces 12 quartiers). */
function resolveNeighborhoodId(place?: SavedPlace): string | undefined {
  if (!place) return undefined;
  return NEIGHBORHOODS.find((n) => place.address.includes(n.name))?.id;
}

function QuickPlaceButton({
  icon,
  label,
  onClick,
  className,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'tap-target flex flex-col items-center gap-2 rounded-lg border border-border bg-background p-4 text-center transition-colors hover:border-primary-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        className
      )}
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-primary-800">
        {icon}
      </span>
      <span className="text-caption font-medium text-foreground">{label}</span>
    </button>
  );
}

function DestinationSearchCta({ className }: { className?: string }) {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => navigate('/passenger/search')}
      className={cn(
        'flex h-14 w-full items-center gap-3 rounded-md border border-input bg-background px-4 text-left transition-colors hover:border-primary-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        className
      )}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-800 text-white">
        <Search className="h-4 w-4" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-body font-semibold text-foreground">Où souhaitez-vous aller ?</span>
        <span className="block text-caption text-muted-foreground">Estimation instantanée du prix</span>
      </span>
    </button>
  );
}

function HeaderActions({
  account,
  hasUnread,
  avatarSize = 'sm',
}: {
  account: { name: string; avatar?: string };
  hasUnread: boolean;
  avatarSize?: 'sm' | 'md';
}) {
  const navigate = useNavigate();
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => navigate('/passenger/notifications')}
        aria-label="Notifications"
        className="tap-target relative flex items-center justify-center rounded-full bg-surface text-muted-foreground shadow-card transition-colors hover:bg-surface/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <Bell className="h-5 w-5" aria-hidden="true" />
        {hasUnread && <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full border border-surface bg-danger" aria-hidden="true" />}
      </button>
      <button
        type="button"
        onClick={() => navigate('/passenger/profile')}
        aria-label="Profil"
        className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <Avatar name={account.name} src={account.avatar} size={avatarSize} />
      </button>
    </div>
  );
}

function PassengerHomeSkeleton() {
  return (
    <div role="status" aria-label="Chargement" className="mx-auto max-w-md px-5 pb-10 pt-8">
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
      <Skeleton className="mt-6 h-14 w-full rounded-md" />
      <div className="mt-4 grid grid-cols-3 gap-3">
        <Skeleton className="h-24 rounded-lg" />
        <Skeleton className="h-24 rounded-lg" />
        <Skeleton className="h-24 rounded-lg" />
      </div>
    </div>
  );
}

export default function PassengerHomePage() {
  const navigate = useNavigate();
  const account = useAuthStore((s) => s.account);
  const places = useSavedPlacesStore((s) => s.places);
  const notifications = useNotificationsStore((s) => s.notifications);
  const isDesktop = useIsDesktop();
  if (!account) return <PassengerHomeSkeleton />;

  const firstName = account.name.split(' ')[0];
  const home = places.find((p) => p.label === 'Home');
  const work = places.find((p) => p.label === 'Work');
  const hasUnread = notifications.some((n) => n.userId === account.id && !n.read);

  const bookOrManage = (place: SavedPlace | undefined) => {
    const neighborhoodId = resolveNeighborhoodId(place);
    if (neighborhoodId) navigate('/passenger/booking', { state: { destinationId: neighborhoodId } });
    else navigate('/passenger/profile/saved-places');
  };

  const quickPlaces = (
    <>
      <QuickPlaceButton icon={<Home className="h-5 w-5" />} label="Domicile" onClick={() => bookOrManage(home)} />
      <QuickPlaceButton icon={<Briefcase className="h-5 w-5" />} label="Travail" onClick={() => bookOrManage(work)} />
      <QuickPlaceButton icon={<Clock className="h-5 w-5" />} label="Récents" onClick={() => navigate('/passenger/search')} />
    </>
  );

  if (isDesktop) {
    return (
      <div className="flex h-[calc(100vh-4rem)]">
        <div className="flex w-[400px] shrink-0 flex-col gap-6 overflow-y-auto border-r border-border p-8">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="font-display text-h1 text-foreground">Bonjour, {firstName}</h1>
              <p className="mt-1 text-body text-muted-foreground">Réservez une course en quelques secondes.</p>
            </div>
            <HeaderActions account={account} hasUnread={hasUnread} />
          </div>
          <DestinationSearchCta />
          <div className="grid grid-cols-3 gap-3">{quickPlaces}</div>
          <Card>
            <p className="text-body-sm font-semibold text-foreground">Chauffeurs disponibles près de vous</p>
            <p className="mt-1 text-body-sm text-muted-foreground">
              Réservez une course pour suivre votre chauffeur en temps réel sur la carte.
            </p>
          </Card>
        </div>
        <div className="relative flex-1">
          <MapView center={CONAKRY_MAP_CENTER} zoom={12.5} markers={NEARBY_VEHICLE_MARKERS} interactive={false} className="h-full w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[calc(100vh-5rem)] w-full overflow-hidden">
      <div className="absolute inset-0">
        <MapView center={CONAKRY_MAP_CENTER} zoom={12.3} markers={NEARBY_VEHICLE_MARKERS} interactive={false} className="h-full w-full" />
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-background via-background/70 to-transparent" />

      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="relative z-10 flex items-center justify-between px-5 pt-6"
      >
        <div>
          <p className="text-body-sm text-muted-foreground">Bonjour,</p>
          <p className="font-display text-h3 text-foreground">{firstName}</p>
        </div>
        <HeaderActions account={account} hasUnread={hasUnread} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="safe-bottom absolute inset-x-0 bottom-0 z-10 rounded-t-xl border-t border-border bg-surface p-5 shadow-sheet"
      >
        <DestinationSearchCta className="mb-4" />
        <div className="grid grid-cols-3 gap-3">{quickPlaces}</div>
      </motion.div>
    </div>
  );
}
