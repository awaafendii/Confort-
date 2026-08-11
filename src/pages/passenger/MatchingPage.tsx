import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Car, MessageCircle, Navigation2, Phone } from 'lucide-react';
import { Avatar, Badge, Button, Card, Rating, toast } from '@/components/ui';
import { getNeighborhood } from '@/data/neighborhoods';
import { calculateFaresByCategory } from '@/data/pricing';
import { pickDriverFor } from '@/data/mockDrivers';
import { VEHICLE_COLORS } from '@/data/vehicleColors';
import { RIDE_CATEGORIES_CONFIG } from '@/data/pricing';
import { formatFare } from '@/utils/format';
import type { Driver, PaymentMethod, RideCategory } from '@/types';

const ORIGIN_ID = 'kaloum';

interface MatchState {
  destinationId?: string;
  category?: RideCategory;
  paymentMethod?: PaymentMethod;
}

export default function MatchingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { destinationId, category, paymentMethod } = (location.state as MatchState | null) ?? {};

  const [match, setMatch] = useState<{ driver: Driver; etaMin: number } | null>(null);

  useEffect(() => {
    if (!destinationId || !category) {
      navigate('/passenger', { replace: true });
      return;
    }
    const timeout = setTimeout(() => setMatch(pickDriverFor(category)), 2200);
    return () => clearTimeout(timeout);
  }, [destinationId, category, navigate]);

  const fare = useMemo(
    () => (destinationId && category ? calculateFaresByCategory(ORIGIN_ID, destinationId)[category] : 0),
    [destinationId, category]
  );

  if (!destinationId || !category) return null;

  const destination = getNeighborhood(destinationId)!;
  const cancel = () => {
    toast('Course annulée.');
    navigate('/passenger', { replace: true });
  };

  if (!match) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
        <div className="relative mb-8 flex h-32 w-32 items-center justify-center">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="absolute inset-0 rounded-full border-2 border-primary-200"
              initial={{ scale: 0.4, opacity: 0.6 }}
              animate={{ scale: 1.4, opacity: 0 }}
              transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.5, ease: 'easeOut' }}
            />
          ))}
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-800 text-white">
            <Car className="h-7 w-7" />
          </div>
        </div>
        <p className="font-display text-h3 text-foreground">Recherche de votre chauffeur...</p>
        <p className="mt-2 text-sm text-muted-foreground">Direction {destination.name}, Conakry</p>
        <Button variant="outline" size="lg" className="mt-10 w-full max-w-xs" onClick={cancel}>
          Annuler
        </Button>
      </div>
    );
  }

  const { driver, etaMin } = match;
  const color = VEHICLE_COLORS[driver.vehicle.color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="mx-auto flex min-h-screen max-w-md flex-col justify-between bg-background px-5 pb-8 pt-10"
    >
      <div>
        <div className="mb-6 text-center">
          <Badge variant="secondary" className="mb-3">
            Chauffeur trouvé
          </Badge>
          <p className="font-display text-h3 text-foreground">Arrive dans {etaMin} min</p>
        </div>

        <Card className="flex items-center gap-4">
          <Avatar name={driver.name} src={driver.avatar} size="lg" status="online" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-foreground">{driver.name}</p>
            <Rating value={driver.rating} showValue size={14} />
          </div>
        </Card>

        <Card className="mt-3 flex items-center gap-3.5">
          <span className="h-8 w-8 shrink-0 rounded-full border border-border" style={{ backgroundColor: color.hex }} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground">
              {driver.vehicle.brand} {driver.vehicle.model} · {color.label}
            </p>
            <p className="text-xs text-muted-foreground">{driver.vehicle.plateNumber}</p>
          </div>
          <Badge variant="neutral">{RIDE_CATEGORIES_CONFIG[category].label}</Badge>
        </Card>

        <Card className="mt-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Destination</span>
            <span className="font-medium text-foreground">{destination.name}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{paymentMethod ?? 'ESPECE'}</span>
            <span className="font-display text-base font-bold text-foreground">{formatFare(fare)}</span>
          </div>
        </Card>

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
      </div>

      <div className="space-y-3">
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={() =>
            navigate('/passenger/tracking', { replace: true, state: { destinationId, category, paymentMethod, driver } })
          }
        >
          <Navigation2 className="h-4 w-4" /> Suivre en temps réel
        </Button>
        <Button variant="ghost" size="lg" className="w-full text-danger hover:bg-danger/10" onClick={cancel}>
          Annuler la course
        </Button>
      </div>
    </motion.div>
  );
}
