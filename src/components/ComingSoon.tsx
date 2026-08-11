import React from 'react';
import { Clock } from 'lucide-react';
import { EmptyState } from '@/components/ui';

export interface ComingSoonProps {
  icon?: React.ReactNode;
  title: string;
  phase: string;
  description?: string;
}

/**
 * Remplace un écran vide pour les fonctionnalités pas encore construites
 * (respecte la consigne "jamais d'écran vide") tout en étant honnête sur
 * l'avancement du roadmap 13 phases.
 */
export const ComingSoon: React.FC<ComingSoonProps> = ({ icon, title, phase, description }) => (
  <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-6">
    <EmptyState
      icon={icon ?? <Clock className="h-7 w-7" />}
      title={title}
      description={description ?? `Cette fonctionnalité arrive avec la ${phase}.`}
      className="w-full"
    />
  </div>
);
