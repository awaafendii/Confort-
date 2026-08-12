import React from 'react';
import { AlertTriangle, LifeBuoy, Phone, Share2, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SafetyPanelProps {
  onShareTrip?: () => void;
  onCallDriver?: () => void;
  onContactSupport?: () => void;
  onReportIssue?: () => void;
  onSOS?: () => void;
  className?: string;
}

interface SafetyAction {
  key: string;
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
}

/**
 * Absent de l'app d'origine (audit § 4, point manquant) — actions de sécurité
 * pendant une course (Tracking). Le SOS reste accessible mais volontairement
 * de même gabarit que les autres actions plutôt que dominant (brief § 17).
 */
export const SafetyPanel: React.FC<SafetyPanelProps> = ({
  onShareTrip,
  onCallDriver,
  onContactSupport,
  onReportIssue,
  onSOS,
  className,
}) => {
  const actions: SafetyAction[] = [
    { key: 'share', label: 'Partager le trajet', icon: <Share2 className="h-5 w-5" />, onClick: onShareTrip },
    { key: 'call', label: 'Appeler le chauffeur', icon: <Phone className="h-5 w-5" />, onClick: onCallDriver },
    { key: 'support', label: 'Contacter le support', icon: <LifeBuoy className="h-5 w-5" />, onClick: onContactSupport },
    { key: 'report', label: 'Signaler un problème', icon: <AlertTriangle className="h-5 w-5" />, onClick: onReportIssue },
  ].filter((a) => a.onClick);

  return (
    <div className={cn('space-y-4', className)}>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <button
            key={action.key}
            type="button"
            onClick={action.onClick}
            className="flex flex-col items-center gap-2 rounded-lg border border-border bg-surface p-4 text-center transition-colors hover:border-primary-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-50 text-primary-800">
              {action.icon}
            </span>
            <span className="text-body-sm font-medium text-foreground">{action.label}</span>
          </button>
        ))}
      </div>
      {onSOS && (
        <button
          type="button"
          onClick={onSOS}
          className="flex w-full items-center justify-center gap-2 rounded-md border border-danger/30 bg-danger/10 py-3 text-button text-danger transition-colors hover:bg-danger/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger focus-visible:ring-offset-2"
        >
          <ShieldAlert className="h-5 w-5" aria-hidden="true" />
          SOS — Alerter les secours
        </button>
      )}
    </div>
  );
};
