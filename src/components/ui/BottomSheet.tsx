import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface BottomSheetProps {
  open: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  className?: string;
  /** Rend le sheet ancré dans son conteneur plutôt qu'en portal plein écran (utile en démo desktop). */
  inline?: boolean;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({ open, onClose, children, className, inline = false }) => {
  useEffect(() => {
    if (inline || !open) return;
    const onKeyDown = (e: KeyboardEvent) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, inline, onClose]);

  const sheet = (
    <AnimatePresence>
      {open && (
        <div className={cn(inline ? 'absolute inset-x-0 bottom-0 z-10' : 'fixed inset-x-0 bottom-0 z-50')}>
          {!inline && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 -z-10 bg-primary-950/40"
              onClick={onClose}
              aria-hidden="true"
            />
          )}
          <motion.div
            role={inline ? undefined : 'dialog'}
            aria-modal={inline ? undefined : true}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              'safe-bottom w-full rounded-t-2xl border-t border-border bg-background px-5 pb-6 pt-3 shadow-sheet',
              className
            )}
          >
            <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-border" aria-hidden="true" />
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  if (inline) return sheet;
  return createPortal(sheet, document.body);
};
