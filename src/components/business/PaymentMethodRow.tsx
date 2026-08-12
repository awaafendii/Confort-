import React from 'react';
import { Check, Trash2 } from 'lucide-react';
import { Badge, IconButton } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { SavedPaymentMethod } from '@/types';

export interface PaymentMethodRowProps {
  method: SavedPaymentMethod;
  icon: React.ReactNode;
  /** Mode sélection (Booking) — bascule le style actif et ajoute role="radio". */
  selected?: boolean;
  onSelect?: () => void;
  /** Mode gestion (PaymentMethodsPage) — actions inline. */
  onSetDefault?: () => void;
  onRemove?: () => void;
  className?: string;
}

/** Ligne de moyen de paiement dupliquée entre BookingPage et PaymentMethodsPage (audit § 7). */
export const PaymentMethodRow: React.FC<PaymentMethodRowProps> = ({
  method,
  icon,
  selected,
  onSelect,
  onSetDefault,
  onRemove,
  className,
}) => {
  const selectable = onSelect !== undefined;

  const content = (
    <>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary-50 text-primary-800">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-body font-medium text-foreground">{method.label}</span>
          {method.isDefault && (
            <Badge variant="accent" className="shrink-0">
              Par défaut
            </Badge>
          )}
        </span>
      </span>
      {selectable && selected && <Check className="h-5 w-5 shrink-0 text-primary-800" aria-hidden="true" />}
    </>
  );

  if (selectable) {
    return (
      <button
        type="button"
        role="radio"
        aria-checked={selected}
        onClick={onSelect}
        className={cn(
          'flex w-full items-center gap-3 rounded-lg border p-3.5 text-left transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          selected ? 'border-primary-700 bg-primary-50' : 'border-border bg-surface hover:border-primary-200',
          className
        )}
      >
        {content}
      </button>
    );
  }

  return (
    <div className={cn('flex items-center gap-3 rounded-lg border border-border bg-surface p-4', className)}>
      {content}
      <span className="flex shrink-0 items-center gap-1">
        {!method.isDefault && onSetDefault && (
          <button
            type="button"
            onClick={onSetDefault}
            className="whitespace-nowrap rounded-sm px-2 py-1.5 text-caption font-semibold text-primary-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Par défaut
          </button>
        )}
        {onRemove && (
          <IconButton
            icon={<Trash2 className="h-4 w-4" />}
            aria-label={`Supprimer ${method.label}`}
            variant="ghost"
            size="sm"
            className="text-danger hover:bg-danger/10"
            onClick={onRemove}
          />
        )}
      </span>
    </div>
  );
};
