import React from 'react';
import { LifeBuoy, MessageCircle } from 'lucide-react';
import { BackButton, Button, Card, toast } from '@/components/ui';

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
  return (
    <div className="mx-auto max-w-md px-5 pb-10 pt-8 lg:max-w-lg lg:px-8">
      <BackButton className="mb-2 lg:hidden" />
      <h1 className="font-display text-h2 text-foreground">Aide</h1>
      <p className="mt-2 text-body text-muted-foreground">Questions fréquentes sur Confort+.</p>

      <div className="mt-6 space-y-3">
        {FAQ.map((item) => (
          <details key={item.q} className="group rounded-lg border border-border bg-background p-4 open:shadow-card">
            <summary className="flex cursor-pointer list-none items-center justify-between rounded-sm text-body font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              {item.q}
              <span className="ml-3 text-muted-foreground transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 text-body-sm text-muted-foreground">{item.a}</p>
          </details>
        ))}
      </div>

      <Card className="mt-8 flex items-center gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-50 text-accent-800">
          <LifeBuoy className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p className="text-body font-semibold text-foreground">Besoin d'aide supplémentaire ?</p>
          <p className="text-body-sm text-muted-foreground">Le support en direct depuis l'app n'est pas encore disponible.</p>
        </div>
      </Card>
      <Button
        variant="outline"
        size="lg"
        className="mt-4 w-full"
        onClick={() => toast("Le support en direct n'est pas encore disponible depuis l'app.")}
      >
        <MessageCircle className="h-4 w-4" /> Contacter le support
      </Button>
    </div>
  );
}
