import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

export interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** true = variante danger (blocage, suppression...). false = confirmation neutre. */
  destructive?: boolean;
  loading?: boolean;
}

/**
 * Généralise le seul pattern de confirmation à deux étapes trouvé dans
 * l'audit (SecurityPage) pour qu'il devienne disponible partout — les
 * actions "Bloquer"/"Suspendre"/"Supprimer" exécutées en un clic sans
 * confirmation étaient le problème UX le plus répété du rapport.
 */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  destructive = true,
  loading = false,
}) => (
  <Modal open={open} onClose={onClose} title={title}>
    {description && <p className="text-body text-muted-foreground">{description}</p>}
    <div className="mt-6 flex gap-3">
      <Button variant="outline" className="flex-1" onClick={onClose} disabled={loading}>
        {cancelLabel}
      </Button>
      <Button variant={destructive ? 'danger' : 'primary'} className="flex-1" onClick={onConfirm} loading={loading}>
        {confirmLabel}
      </Button>
    </div>
  </Modal>
);
