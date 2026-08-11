import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from './store';

/** Protège les routes qui nécessitent une session active. */
export function RequireAuth() {
  const account = useAuthStore((s) => s.account);
  const hasSeenOnboarding = useAuthStore((s) => s.hasSeenOnboarding);
  if (!account) return <Navigate to={hasSeenOnboarding ? '/welcome' : '/onboarding'} replace />;
  return <Outlet />;
}

/** Réserve les routes de l'espace passager aux comptes PASSENGER. */
export function RequirePassenger() {
  const account = useAuthStore((s) => s.account);
  if (account?.role !== 'PASSENGER') return <Navigate to="/home" replace />;
  return <Outlet />;
}

/** Réserve les routes de l'espace chauffeur aux comptes DRIVER. */
export function RequireDriver() {
  const account = useAuthStore((s) => s.account);
  if (account?.role !== 'DRIVER') return <Navigate to="/home" replace />;
  return <Outlet />;
}

/** Réserve les routes de l'espace admin aux comptes ADMIN/SUPER_ADMIN. */
export function RequireAdmin() {
  const account = useAuthStore((s) => s.account);
  if (account?.role !== 'ADMIN' && account?.role !== 'SUPER_ADMIN') return <Navigate to="/home" replace />;
  return <Outlet />;
}

/** Réserve les routes sensibles (journal d'audit) aux comptes SUPER_ADMIN uniquement — un ADMIN standard reste sur le dashboard. */
export function RequireSuperAdmin() {
  const account = useAuthStore((s) => s.account);
  if (account?.role !== 'SUPER_ADMIN') return <Navigate to="/admin" replace />;
  return <Outlet />;
}

/** Empêche un utilisateur déjà connecté de revoir les écrans d'authentification. */
export function RedirectIfAuthenticated() {
  const account = useAuthStore((s) => s.account);
  if (account) return <Navigate to="/home" replace />;
  return <Outlet />;
}

/** Point d'entrée "/" — aiguille vers onboarding, welcome ou home selon l'état de session. */
export function RootGate() {
  const account = useAuthStore((s) => s.account);
  const hasSeenOnboarding = useAuthStore((s) => s.hasSeenOnboarding);
  if (!hasSeenOnboarding) return <Navigate to="/onboarding" replace />;
  if (account) return <Navigate to="/home" replace />;
  return <Navigate to="/welcome" replace />;
}
