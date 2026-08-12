import React from 'react';
import { cn } from '@/lib/utils';

export interface SwitchProps {
  checked: boolean;
  onChange: () => void;
  label: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Toggle générique — remplace les 3 implémentations locales identiques
 * trouvées dans l'audit (AdminSettingsPage, SecurityPage, DriverHomePage).
 */
export const Switch: React.FC<SwitchProps> = ({ checked, onChange, label, disabled = false, className }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    disabled={disabled}
    onClick={onChange}
    className={cn(
      'relative h-8 w-14 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
      checked ? 'bg-accent-600' : 'bg-border',
      className
    )}
  >
    <span
      className={cn(
        'absolute top-1 h-6 w-6 rounded-full bg-white shadow-card transition-transform',
        checked ? 'translate-x-7' : 'translate-x-1'
      )}
    />
  </button>
);
