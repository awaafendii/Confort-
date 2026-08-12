import React from 'react';
import { cn } from '@/lib/utils';
import { formatFare } from '@/utils/format';

export interface PriceLineItem {
  label: string;
  amount: number;
}

export interface PriceBreakdownProps {
  items: PriceLineItem[];
  total: number;
  className?: string;
}

/** Récapitulatif tarifaire recomposé à la main sur BookingPage/RideCompletedPage/RideDetailPage (audit § 7). */
export const PriceBreakdown: React.FC<PriceBreakdownProps> = ({ items, total, className }) => (
  <div className={cn('divide-y divide-border', className)}>
    {items.map((item) => (
      <div key={item.label} className="flex items-center justify-between py-2.5 text-body text-muted-foreground">
        <span>{item.label}</span>
        <span className="text-foreground">{formatFare(item.amount)}</span>
      </div>
    ))}
    <div className="flex items-center justify-between pt-3 text-h3 text-foreground">
      <span>Total</span>
      <span>{formatFare(total)}</span>
    </div>
  </div>
);
