import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store';

/** "/home" — chaque rôle a désormais son propre espace : passager, chauffeur ou admin. */
export default function HomeDispatch() {
  const account = useAuthStore((s) => s.account);
  if (account?.role === 'PASSENGER') return <Navigate to="/passenger" replace />;
  if (account?.role === 'DRIVER') return <Navigate to="/driver" replace />;
  return <Navigate to="/admin" replace />;
}
