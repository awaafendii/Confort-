import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Ban, CheckCircle2, Mail, Phone, X } from 'lucide-react';
import { Avatar, Button, IconButton } from '@/components/ui';
import { RideCard } from '@/components/business';
import { useAdminStore } from '@/features/admin/adminStore';
import { MOCK_PLATFORM_RIDES } from '@/data/mockPlatformRides';
import { UserStatusBadge } from './UserStatusBadge';
import { RIDE_STATUS_CONFIG } from './rideStatus';
import type { PlatformUser } from '@/types';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

export interface UserDetailsDrawerProps {
  user: PlatformUser | null;
  onClose: () => void;
  onToggleStatus: (user: PlatformUser) => void;
}

/**
 * Panneau latéral (pas de Drawer générique dans ui/ — anticiper cette forme pour d'autres
 * écrans aurait été spéculatif ; voir AdminDataTable pour ce qui, en revanche, était
 * explicitement demandé comme infra partagée dès 7.2).
 */
export const UserDetailsDrawer: React.FC<UserDetailsDrawerProps> = ({ user, onClose, onToggleStatus }) => {
  const drivers = useAdminStore((s) => s.drivers);

  useEffect(() => {
    if (!user) return;
    const onKeyDown = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [user, onClose]);

  const rides = user ? MOCK_PLATFORM_RIDES.filter((r) => r.passengerId === user.id).slice(0, 8) : [];
  const blocked = user?.status === 'BLOCKED';

  return createPortal(
    <AnimatePresence>
      {user && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-primary-950/40 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`Détails de ${user.name}`}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-border bg-surface p-6 shadow-modal"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar name={user.name} src={user.avatar} size="lg" />
                <div>
                  <p className="text-h3 text-foreground">{user.name}</p>
                  <UserStatusBadge status={user.status} className="mt-1" />
                </div>
              </div>
              <IconButton icon={<X className="h-5 w-5" />} aria-label="Fermer" size="sm" onClick={onClose} />
            </div>

            <div className="mt-6 space-y-2.5 border-t border-border pt-5">
              <div className="flex items-center gap-2.5 text-body-sm text-foreground">
                <Phone className="h-4 w-4 text-muted-foreground" />
                {user.phone}
              </div>
              <div className="flex items-center gap-2.5 text-body-sm text-foreground">
                <Mail className="h-4 w-4 text-muted-foreground" />
                {user.email}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-border p-3.5">
                <p className="text-caption text-muted-foreground">Courses</p>
                <p className="mt-0.5 text-h3 text-foreground">{user.tripsCount}</p>
              </div>
              <div className="rounded-xl border border-border p-3.5">
                <p className="text-caption text-muted-foreground">Membre depuis</p>
                <p className="mt-0.5 text-body-sm font-semibold text-foreground">{formatDate(user.createdAt)}</p>
              </div>
            </div>

            <Button variant={blocked ? 'primary' : 'danger'} className="mt-5 w-full" onClick={() => onToggleStatus(user)}>
              {blocked ? <CheckCircle2 className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
              {blocked ? 'Débloquer ce compte' : 'Bloquer ce compte'}
            </Button>

            <h3 className="mb-3 mt-8 text-body-sm font-semibold text-foreground">Historique des courses</h3>
            {rides.length > 0 ? (
              <div className="space-y-2">
                {rides.map((ride) => (
                  <RideCard key={ride.id} ride={ride} statusConfig={RIDE_STATUS_CONFIG} driverName={drivers.find((d) => d.id === ride.driverId)?.name} />
                ))}
              </div>
            ) : (
              <p className="text-body-sm text-muted-foreground">Aucune course enregistrée.</p>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
