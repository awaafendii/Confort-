import { Toaster as Sonner } from 'sonner';

/** Toaster global Confort+ — à monter une fois à la racine de l'app. */
export const Toaster = () => (
  <Sonner
    position="top-center"
    toastOptions={{
      classNames: {
        toast:
          'rounded-xl border border-border bg-background text-foreground shadow-elevated font-sans text-sm',
        title: 'font-semibold',
        actionButton: '!bg-primary-800',
        cancelButton: '!bg-surface',
      },
    }}
  />
);

export { toast } from 'sonner';
