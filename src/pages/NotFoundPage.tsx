import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { EmptyState } from '@/components/ui';

/** Route "*" — toute URL inconnue atterrit ici plutôt que sur un écran blanc. */
export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto flex min-h-screen max-w-md items-center px-6">
      <EmptyState
        icon={<Compass className="h-7 w-7" />}
        title="Page introuvable"
        description="Cette adresse ne correspond à aucune page de Confort+."
        actionLabel="Retour à l'accueil"
        onAction={() => navigate('/', { replace: true })}
        className="w-full"
      />
    </div>
  );
}
