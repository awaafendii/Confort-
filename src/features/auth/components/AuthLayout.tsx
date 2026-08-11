import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  children: React.ReactNode;
  className?: string;
  wide?: boolean;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ title, subtitle, onBack, children, className, wide = false }) => (
  <div className="flex min-h-screen w-full flex-col bg-background">
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 py-8 sm:py-12">
      <div className="mb-8 flex items-center gap-3">
        {onBack ? (
          <button
            onClick={onBack}
            aria-label="Retour"
            className="tap-target -ml-2 flex items-center justify-center rounded-full text-muted-foreground hover:bg-surface"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        ) : (
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-800">
            <span className="font-display text-sm font-extrabold text-white">C+</span>
          </div>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className={cn('flex flex-1 flex-col', wide && 'max-w-none', className)}
      >
        <h1 className="font-display text-h2 text-foreground">{title}</h1>
        {subtitle && <p className="mt-2 text-[15px] text-muted-foreground">{subtitle}</p>}
        <div className="mt-8 flex-1">{children}</div>
      </motion.div>
    </div>
  </div>
);
