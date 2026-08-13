import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { Button, Card, Rating, Textarea, toast } from '@/components/ui';
import { RideSummary } from '@/components/business';
import { DELIVERY_MODES_CONFIG, PACKAGE_SIZE_CONFIG } from '@/data/deliveryPricing';
import { useDeliveryHistoryStore } from '@/features/delivery/deliveryHistoryStore';
import { formatDistance, formatDuration, formatFare } from '@/utils/format';
import type { Delivery, DeliveryMode, DeliveryStop, Driver, PackageSize, PaymentMethod } from '@/types';

interface CompletedState {
  driver?: Driver;
  mode?: DeliveryMode;
  packageSize?: PackageSize;
  recipientName?: string;
  recipientPhone?: string;
  note?: string;
  paymentMethod?: PaymentMethod;
  pickup?: DeliveryStop;
  dropoff?: DeliveryStop;
  distanceKm?: number;
  durationMin?: number;
  fare?: number;
}

/** Mêmes valeurs et délai que RideCompletedPage.tsx. */
const TIP_OPTIONS = [0, 500, 1000, 2000];
const RETURN_DELAY_MS = 1500;

export default function DeliveryCompletedPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as CompletedState | null) ?? {};
  const { driver, mode, packageSize, recipientName, recipientPhone, note, paymentMethod, pickup, dropoff, distanceKm, durationMin, fare } = state;
  const addDelivery = useDeliveryHistoryStore((s) => s.addDelivery);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [tip, setTip] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!driver || !mode || !packageSize || !pickup || !dropoff || !recipientName || !recipientPhone) {
      navigate('/passenger', { replace: true });
    }
  }, [driver, mode, packageSize, pickup, dropoff, recipientName, recipientPhone, navigate]);

  if (!driver || !mode || !packageSize || !pickup || !dropoff || !recipientName || !recipientPhone) return null;

  const finish = () => {
    if (submitting) return;
    setSubmitting(true);
    const now = new Date().toISOString();
    const delivery: Delivery = {
      id: `delivery-${Date.now()}`,
      senderId: 'demo-passenger',
      courierId: driver.id,
      pickup,
      dropoff,
      recipientName,
      recipientPhone,
      mode,
      packageSize,
      note,
      status: 'COMPLETED',
      distanceKm: distanceKm ?? 0,
      durationMin: durationMin ?? 0,
      fare: fare ?? 0,
      currency: 'GNF',
      paymentMethod: paymentMethod ?? 'ESPECE',
      requestedAt: now,
      completedAt: now,
      rating: rating || undefined,
      ratingComment: comment.trim() || undefined,
      tip: tip || undefined,
    };
    addDelivery(delivery);
    toast.success('Merci pour votre note !');
    setTimeout(() => navigate('/passenger', { replace: true }), RETURN_DELAY_MS);
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-between bg-background px-5 pb-8 pt-12">
      <div>
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent-50 text-accent-700">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <p className="font-display text-h2 text-foreground">Livraison terminée</p>
        </div>

        <Card>
          <RideSummary pickup={pickup} destination={dropoff} />
          <div className="mt-4 space-y-2.5 border-t border-border pt-4">
            <div className="flex items-center justify-between text-body-sm">
              <span className="text-muted-foreground">Destinataire</span>
              <span className="font-medium text-foreground">{recipientName}</span>
            </div>
            <div className="flex items-center justify-between text-body-sm">
              <span className="text-muted-foreground">Colis</span>
              <span className="font-medium text-foreground">
                {DELIVERY_MODES_CONFIG[mode].label} · {PACKAGE_SIZE_CONFIG[packageSize].label}
              </span>
            </div>
            <div className="flex items-center justify-between text-body-sm">
              <span className="text-muted-foreground">Distance</span>
              <span className="font-medium text-foreground">{formatDistance(distanceKm ?? 0)}</span>
            </div>
            <div className="flex items-center justify-between text-body-sm">
              <span className="text-muted-foreground">Durée</span>
              <span className="font-medium text-foreground">{formatDuration(durationMin ?? 0)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-2.5">
              <span className="font-semibold text-foreground">Total</span>
              <span className="font-display text-h3 text-foreground">{formatFare(fare ?? 0)}</span>
            </div>
          </div>
        </Card>

        <Card className="mt-4 text-center">
          <p className="mb-3 text-body font-medium text-foreground">Comment était votre livraison avec {driver.name.split(' ')[0]} ?</p>
          <div className="flex justify-center">
            <Rating value={rating} interactive onChange={setRating} size={30} />
          </div>
          <Textarea className="mt-4" placeholder="Un commentaire ?" rows={3} value={comment} onChange={(e) => setComment(e.target.value)} />
        </Card>

        <Card className="mt-4">
          <p className="mb-3 text-body font-medium text-foreground">Ajouter un pourboire ?</p>
          <div className="grid grid-cols-4 gap-2">
            {TIP_OPTIONS.map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => setTip(amount)}
                className={
                  'rounded-md border py-2.5 text-body-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ' +
                  (tip === amount ? 'border-primary-700 bg-primary-50 text-primary-800' : 'border-border text-muted-foreground')
                }
              >
                {amount === 0 ? 'Non merci' : `+${amount}`}
              </button>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-6">
        <Button variant="primary" size="lg" className="w-full" onClick={finish} loading={submitting} disabled={submitting}>
          Terminer
        </Button>
      </div>
    </div>
  );
}
