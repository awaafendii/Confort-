import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold', {
  variants: {
    variant: {
      primary: 'border-primary-200 bg-primary-50 text-primary-800',
      secondary: 'border-secondary-200 bg-secondary-50 text-secondary-800',
      success: 'border-secondary-200 bg-secondary-50 text-secondary-700',
      warning: 'border-warning/20 bg-warning/10 text-warning-strong',
      danger: 'border-danger/20 bg-danger/10 text-danger',
      neutral: 'border-border bg-surface text-muted-foreground',
    },
  },
  defaultVariants: { variant: 'neutral' },
});

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export const Badge: React.FC<BadgeProps> = ({ className, variant, ...props }) => (
  <span className={cn(badgeVariants({ variant }), className)} {...props} />
);
