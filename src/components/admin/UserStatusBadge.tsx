import React from 'react';
import { StatusBadge, type StatusConfig } from '@/components/ui';
import type { PlatformUser } from '@/types';

export const USER_STATUS_CONFIG: Record<PlatformUser['status'], StatusConfig> = {
  ACTIVE: { label: 'Actif', variant: 'success' },
  NEW: { label: 'Nouveau', variant: 'neutral' },
  SUSPENDED: { label: 'Suspendu', variant: 'warning' },
  BLOCKED: { label: 'Bloqué', variant: 'danger' },
};

export const UserStatusBadge: React.FC<{ status: PlatformUser['status']; className?: string }> = ({ status, className }) => (
  <StatusBadge status={status} config={USER_STATUS_CONFIG} className={className} />
);
