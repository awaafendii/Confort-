import React, { useRef } from 'react';
import { cn } from '@/lib/utils';

export interface RadioGroupProps {
  label?: string;
  children: React.ReactNode;
  orientation?: 'vertical' | 'horizontal';
  className?: string;
}

/**
 * Conteneur sémantique pour un groupe de `Radio` — remplace les ~4
 * réimplémentations différentes du pattern "choisir 1 parmi N" trouvées dans
 * l'audit (RegisterPage véhicule, RoleSelectCard, VehicleColorPicker, chips
 * de filtre admin), chacune avec un niveau d'accessibilité différent.
 * Navigation clavier flèches native (comme un vrai groupe de radios HTML).
 */
export const RadioGroup: React.FC<RadioGroupProps> = ({ label, children, orientation = 'vertical', className }) => {
  const groupRef = useRef<HTMLDivElement>(null);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const forwardKey = orientation === 'vertical' ? 'ArrowDown' : 'ArrowRight';
    const backwardKey = orientation === 'vertical' ? 'ArrowUp' : 'ArrowLeft';
    if (e.key !== forwardKey && e.key !== backwardKey) return;

    const radios = Array.from(groupRef.current?.querySelectorAll<HTMLInputElement>('input[type="radio"]:not(:disabled)') ?? []);
    const currentIndex = radios.findIndex((r) => r === document.activeElement);
    if (currentIndex === -1 || radios.length === 0) return;

    e.preventDefault();
    const direction = e.key === forwardKey ? 1 : -1;
    const next = radios[(currentIndex + direction + radios.length) % radios.length];
    next.focus();
    next.click();
  };

  return (
    <div
      ref={groupRef}
      role="radiogroup"
      aria-label={label}
      onKeyDown={onKeyDown}
      className={cn(orientation === 'vertical' ? 'flex flex-col gap-3' : 'flex flex-row gap-4', className)}
    >
      {children}
    </div>
  );
};
