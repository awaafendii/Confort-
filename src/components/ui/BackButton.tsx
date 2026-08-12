import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BackButtonProps {
  label?: string;
  /** Destination explicite ; par défaut, revient dans l'historique (navigate(-1)). */
  to?: string;
  className?: string;
}

/**
 * Remplace les boutons "Retour" réimplémentés en <button> brut à travers
 * l'app — deux d'entre eux (VehiclePage, DocumentsPage) n'avaient aucun
 * focus-visible, une régression concrète relevée dans l'audit § 3.2.
 */
export const BackButton: React.FC<BackButtonProps> = ({ label = 'Retour', to, className }) => {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => (to ? navigate(to) : navigate(-1))}
      className={cn(
        'mb-6 flex items-center gap-2 rounded-sm text-body-sm font-semibold text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        className
      )}
    >
      <ArrowLeft className="h-4 w-4" aria-hidden="true" /> {label}
    </button>
  );
};
