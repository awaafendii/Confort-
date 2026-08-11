import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LifeBuoy, MessageCircle } from 'lucide-react';
import { Button, Card, toast } from '@/components/ui';

const FAQ = [
  {
    q: 'Comment estimer le prix d’une course ?',
    a: 'Renseignez votre départ et votre destination : le tarif Confort+ s’affiche avant la réservation, selon le véhicule choisi.',
  },
  {
    q: 'Quels moyens de paiement sont acceptés ?',
    a: 'Espèces, Orange Money, MoMo et carte bancaire — à activer depuis Moyens de paiement.',
  },
  {
    q: 'Comment annuler une course ?',
    a: 'Depuis l’écran de suivi, appuyez sur Annuler. Des frais peuvent s’appliquer après l’arrivée du chauffeur.',
  },
  {
    q: 'Comment devenir pilote Confort+ ?',
    a: 'Créez un compte, choisissez « Pilote » et renseignez les informations de votre véhicule.',
  },
];

/** Générique — réutilisée par les espaces passager et chauffeur. */
export default function HelpPage() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-md px-5 pb-10 pt-8 lg:max-w-lg lg:px-8">
      <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground lg:hidden">
        <ArrowLeft className="h-4 w-4" /> Retour
      </button>
      <h1 className="font-display text-h2 text-foreground">Aide</h1>
      <p className="mt-2 text-[15px] text-muted-foreground">Questions fréquentes sur Confort+.</p>

      <div className="mt-6 space-y-3">
        {FAQ.map((item) => (
          <details key={item.q} className="group rounded-2xl border border-border bg-background p-4 open:shadow-card">
            <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-foreground">
              {item.q}
              <span className="ml-3 text-muted-foreground transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 text-sm text-muted-foreground">{item.a}</p>
          </details>
        ))}
      </div>

      <Card className="mt-8 flex items-center gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary-50 text-secondary-800">
          <LifeBuoy className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">Besoin d'aide supplémentaire ?</p>
          <p className="text-xs text-muted-foreground">Notre équipe support arrive avec la Phase 9.</p>
        </div>
      </Card>
      <Button
        variant="outline"
        size="lg"
        className="mt-4 w-full"
        onClick={() => toast('Le support en direct arrive avec la Phase 9 — Admin dashboard.')}
      >
        <MessageCircle className="h-4 w-4" /> Contacter le support
      </Button>
    </div>
  );
}
