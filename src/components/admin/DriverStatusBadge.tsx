import React from 'react';
import { StatusBadge, type StatusConfig } from '@/components/ui';
import type { DriverVerificationStatus } from '@/types';

export const DRIVER_VERIFICATION_CONFIG: Record<DriverVerificationStatus, StatusConfig> = {
  VERIFIED: { label: 'Vérifié', variant: 'success' },
  PENDING: { label: 'En attente', variant: 'warning' },
  SUSPENDED: { label: 'Suspendu', variant: 'danger' },
};

export const DriverStatusBadge: React.FC<{ status: DriverVerificationStatus; className?: string }> = ({ status, className }) => (
  <StatusBadge status={status} config={DRIVER_VERIFICATION_CONFIG} className={className} />
);
