import React from 'react';
import { cn } from '@/lib/utils';
import { Card } from './Card';

export interface StatCardProps {
  label: string;
  value: string;
  trend?: { value: string; positive?: boolean };
  icon?: React.ReactNode;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, trend, icon, className }) => (
  <Card className={cn('flex items-center justify-between gap-4', className)}>
    <div>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold text-foreground">{value}</p>
      {trend && (
        <p className={cn('mt-1 text-xs font-semibold', trend.positive !== false ? 'text-secondary-700' : 'text-danger')}>
          {trend.value}
        </p>
      )}
    </div>
    {icon && (
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-800">
        {icon}
      </div>
    )}
  </Card>
);
