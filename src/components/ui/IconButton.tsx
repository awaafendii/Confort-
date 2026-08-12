import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const iconButtonVariants = cva(
  'inline-flex shrink-0 items-center justify-center rounded-full tap-target transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-95',
  {
    variants: {
      variant: {
        ghost: 'text-foreground hover:bg-surface',
        outline: 'border border-border bg-background text-foreground hover:bg-surface',
        primary: 'bg-primary-800 text-primary-foreground hover:bg-primary-900',
        danger: 'text-danger hover:bg-danger/10',
      },
      size: {
        sm: 'h-9 w-9',
        md: 'h-11 w-11',
        lg: 'h-14 w-14',
      },
    },
    defaultVariants: { variant: 'ghost', size: 'md' },
  }
);

export interface IconButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'>,
    VariantProps<typeof iconButtonVariants> {
  icon: React.ReactNode;
  /** Obligatoire — un IconButton n'a pas de texte visible, aria-label est la seule description pour un lecteur d'écran. */
  'aria-label': string;
}

/**
 * Bouton icône seule (retour, notifications, appel...). Remplace les icônes
 * répétées telles quelles à travers l'app (voir docs/UIUX_AUDIT.md — pattern
 * dupliqué sans composant dédié).
 */
export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant, size, icon, ...props }, ref) => (
    <button ref={ref} type="button" className={cn(iconButtonVariants({ variant, size }), className)} {...props}>
      {icon}
    </button>
  )
);
IconButton.displayName = 'IconButton';
