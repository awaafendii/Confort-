import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { Home, Wallet, Bell, User, Clock, LayoutDashboard, Users, Car, Route as RouteIcon, LifeBuoy, BarChart3, Settings, ShieldCheck, Loader2 } from 'lucide-react';
import { Toaster } from '@/components/ui';
import { RequireAuth, RequirePassenger, RequireDriver, RequireAdmin, RequireSuperAdmin, RedirectIfAuthenticated, RootGate } from '@/features/auth/guards';
import { useAuthStore } from '@/features/auth/store';
import { AppShell, type NavItem } from '@/layouts/AppShell';

const OnboardingPage = lazy(() => import('@/pages/OnboardingPage'));
const WelcomePage = lazy(() => import('@/pages/WelcomePage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));
const VerifyEmailPage = lazy(() => import('@/pages/VerifyEmailPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPasswordPage'));
const HomeDispatch = lazy(() => import('@/pages/HomeDispatch'));
const StyleGuidePage = lazy(() => import('@/pages/StyleGuidePage'));
const PersonalInfoPage = lazy(() => import('@/pages/shared/PersonalInfoPage'));
const HelpPage = lazy(() => import('@/pages/shared/HelpPage'));
const NotificationsPage = lazy(() => import('@/pages/shared/NotificationsPage'));
const ChatPage = lazy(() => import('@/pages/shared/ChatPage'));
const SecurityPage = lazy(() => import('@/pages/shared/SecurityPage'));
const PassengerHomePage = lazy(() => import('@/pages/passenger/PassengerHomePage'));
const ProfilePage = lazy(() => import('@/pages/passenger/ProfilePage'));
const SavedPlacesPage = lazy(() => import('@/pages/passenger/SavedPlacesPage'));
const WalletPage = lazy(() => import('@/pages/passenger/WalletPage'));
const PaymentMethodsPage = lazy(() => import('@/pages/passenger/PaymentMethodsPage'));
const SearchDestinationPage = lazy(() => import('@/pages/passenger/SearchDestinationPage'));
const BookingPage = lazy(() => import('@/pages/passenger/BookingPage'));
const MatchingPage = lazy(() => import('@/pages/passenger/MatchingPage'));
const TrackingPage = lazy(() => import('@/pages/passenger/TrackingPage'));
const RideCompletedPage = lazy(() => import('@/pages/passenger/RideCompletedPage'));
const TripsPage = lazy(() => import('@/pages/passenger/TripsPage'));
const RideDetailPage = lazy(() => import('@/pages/passenger/RideDetailPage'));
const DriverHomePage = lazy(() => import('@/pages/driver/DriverHomePage'));
const DriverTrackingPage = lazy(() => import('@/pages/driver/DriverTrackingPage'));
const DriverRideCompletedPage = lazy(() => import('@/pages/driver/DriverRideCompletedPage'));
const DriverTripsPage = lazy(() => import('@/pages/driver/DriverTripsPage'));
const DriverRideDetailPage = lazy(() => import('@/pages/driver/DriverRideDetailPage'));
const DriverEarningsPage = lazy(() => import('@/pages/driver/DriverEarningsPage'));
const DriverProfilePage = lazy(() => import('@/pages/driver/DriverProfilePage'));
const VehiclePage = lazy(() => import('@/pages/driver/VehiclePage'));
const DocumentsPage = lazy(() => import('@/pages/driver/DocumentsPage'));
const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage'));
const AdminUsersPage = lazy(() => import('@/pages/admin/AdminUsersPage'));
const AdminDriversPage = lazy(() => import('@/pages/admin/AdminDriversPage'));
const AdminDriverDetailPage = lazy(() => import('@/pages/admin/AdminDriverDetailPage'));
const AdminRidesPage = lazy(() => import('@/pages/admin/AdminRidesPage'));
const AdminRideDetailPage = lazy(() => import('@/pages/admin/AdminRideDetailPage'));
const AdminPaymentsPage = lazy(() => import('@/pages/admin/AdminPaymentsPage'));
const AdminSupportPage = lazy(() => import('@/pages/admin/AdminSupportPage'));
const AdminSupportDetailPage = lazy(() => import('@/pages/admin/AdminSupportDetailPage'));
const AdminSettingsPage = lazy(() => import('@/pages/admin/AdminSettingsPage'));
const AdminAnalyticsPage = lazy(() => import('@/pages/admin/AdminAnalyticsPage'));
const AdminAuditPage = lazy(() => import('@/pages/admin/AdminAuditPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

/** Ordre conventionnel : Profile toujours en dernier (AppShell s'en sert pour le raccourci desktop). */
const PASSENGER_NAV: NavItem[] = [
  { to: '/passenger', label: 'Accueil', icon: Home, end: true },
  { to: '/passenger/trips', label: 'Courses', icon: Clock },
  { to: '/passenger/wallet', label: 'Portefeuille', icon: Wallet },
  { to: '/passenger/notifications', label: 'Notifications', icon: Bell },
  { to: '/passenger/profile', label: 'Profil', icon: User },
];

const DRIVER_NAV: NavItem[] = [
  { to: '/driver', label: 'Accueil', icon: Home, end: true },
  { to: '/driver/trips', label: 'Courses', icon: Clock },
  { to: '/driver/earnings', label: 'Gains', icon: Wallet },
  { to: '/driver/notifications', label: 'Notifications', icon: Bell },
  { to: '/driver/profile', label: 'Profil', icon: User },
];

const ADMIN_NAV: NavItem[] = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/users', label: 'Utilisateurs', icon: Users },
  { to: '/admin/drivers', label: 'Chauffeurs', icon: Car },
  { to: '/admin/rides', label: 'Courses', icon: RouteIcon },
  { to: '/admin/payments', label: 'Paiements', icon: Wallet },
  { to: '/admin/support', label: 'Support', icon: LifeBuoy },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/admin/settings', label: 'Paramètres', icon: Settings },
];

const AUDIT_NAV_ITEM: NavItem = { to: '/admin/audit', label: 'Journal', icon: ShieldCheck };

/** Le journal d'audit n'apparaît dans la navigation admin que pour un compte SUPER_ADMIN — un ADMIN standard n'a pas accès à /admin/audit (RequireSuperAdmin), donc pas de lien mort dans son menu. */
function AdminShell() {
  const account = useAuthStore((s) => s.account);
  const navItems = account?.role === 'SUPER_ADMIN' ? [...ADMIN_NAV, AUDIT_NAV_ITEM] : ADMIN_NAV;
  return <AppShell navItems={navItems} notificationsTo="/admin/notifications" />;
}

/** Repli affiché pendant le chargement du chunk d'une route (Phase 12 — code-splitting par route). */
function RouteLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center" role="status" aria-label="Chargement de la page">
      <Loader2 className="h-8 w-8 animate-spin text-primary-700" aria-hidden="true" />
    </div>
  );
}

/**
 * Phase 3 — Passenger application, Phase 4 — Ride booking, Phase 5 — Driver application.
 * L'espace admin (Phase 9) réutilisera le même AppShell avec ses propres
 * navItems, sans changer ce squelette. Le flux de réservation passager
 * (search → booking → matching) reste hors AppShell, sans navigation
 * persistante, comme les apps de mobilité de référence.
 *
 * Phase 12 — chaque page est chargée via React.lazy() : avant cette phase,
 * App.tsx importait les ~35 pages en dur, ce qui gonflait le bundle initial
 * en un seul chunk (avertissement Vite "> 500 kB" présent depuis la Phase 9).
 * Découper par route laisse le navigateur ne charger que la page visitée.
 * `MotionConfig reducedMotion="user"` respecte le réglage système
 * prefers-reduced-motion pour toutes les animations Framer Motion de l'app
 * (Modal, BottomSheet, onboarding…) sans toucher chaque composant un par un.
 */
export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <Toaster />
        <Suspense fallback={<RouteLoader />}>
          <Routes>
            <Route path="/" element={<RootGate />} />
            <Route path="/onboarding" element={<OnboardingPage />} />

            <Route element={<RedirectIfAuthenticated />}>
              <Route path="/welcome" element={<WelcomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            </Route>

            <Route element={<RequireAuth />}>
              <Route path="/home" element={<HomeDispatch />} />

              <Route element={<RequirePassenger />}>
                <Route path="/passenger/search" element={<SearchDestinationPage />} />
                <Route path="/passenger/booking" element={<BookingPage />} />
                <Route path="/passenger/booking/matching" element={<MatchingPage />} />
                <Route path="/passenger/tracking" element={<TrackingPage />} />
                <Route path="/passenger/chat" element={<ChatPage />} />
                <Route path="/passenger/ride-completed" element={<RideCompletedPage />} />

                <Route element={<AppShell navItems={PASSENGER_NAV} notificationsTo="/passenger/notifications" />}>
                  <Route path="/passenger" element={<PassengerHomePage />} />
                  <Route path="/passenger/trips" element={<TripsPage />} />
                  <Route path="/passenger/trips/:rideId" element={<RideDetailPage />} />
                  <Route path="/passenger/wallet" element={<WalletPage />} />
                  <Route path="/passenger/notifications" element={<NotificationsPage />} />
                  <Route path="/passenger/profile" element={<ProfilePage />} />
                  <Route path="/passenger/profile/personal-info" element={<PersonalInfoPage />} />
                  <Route path="/passenger/profile/saved-places" element={<SavedPlacesPage />} />
                  <Route path="/passenger/profile/help" element={<HelpPage />} />
                  <Route path="/passenger/profile/payment-methods" element={<PaymentMethodsPage />} />
                  <Route path="/passenger/profile/security" element={<SecurityPage />} />
                </Route>
              </Route>

              <Route element={<RequireDriver />}>
                <Route path="/driver/tracking" element={<DriverTrackingPage />} />
                <Route path="/driver/ride-completed" element={<DriverRideCompletedPage />} />
                <Route path="/driver/chat" element={<ChatPage />} />

                <Route element={<AppShell navItems={DRIVER_NAV} notificationsTo="/driver/notifications" />}>
                  <Route path="/driver" element={<DriverHomePage />} />
                  <Route path="/driver/trips" element={<DriverTripsPage />} />
                  <Route path="/driver/trips/:rideId" element={<DriverRideDetailPage />} />
                  <Route path="/driver/earnings" element={<DriverEarningsPage />} />
                  <Route path="/driver/notifications" element={<NotificationsPage />} />
                  <Route path="/driver/profile" element={<DriverProfilePage />} />
                  <Route path="/driver/profile/personal-info" element={<PersonalInfoPage />} />
                  <Route path="/driver/profile/vehicle" element={<VehiclePage />} />
                  <Route path="/driver/profile/documents" element={<DocumentsPage />} />
                  <Route path="/driver/profile/help" element={<HelpPage />} />
                  <Route path="/driver/profile/security" element={<SecurityPage />} />
                </Route>
              </Route>

              <Route element={<RequireAdmin />}>
                <Route element={<AdminShell />}>
                  <Route path="/admin" element={<AdminDashboardPage />} />
                  <Route path="/admin/users" element={<AdminUsersPage />} />
                  <Route path="/admin/drivers" element={<AdminDriversPage />} />
                  <Route path="/admin/drivers/:driverId" element={<AdminDriverDetailPage />} />
                  <Route path="/admin/rides" element={<AdminRidesPage />} />
                  <Route path="/admin/rides/:rideId" element={<AdminRideDetailPage />} />
                  <Route path="/admin/payments" element={<AdminPaymentsPage />} />
                  <Route path="/admin/support" element={<AdminSupportPage />} />
                  <Route path="/admin/support/:ticketId" element={<AdminSupportDetailPage />} />
                  <Route path="/admin/settings" element={<AdminSettingsPage />} />
                  <Route path="/admin/notifications" element={<NotificationsPage />} />
                  <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
                  <Route element={<RequireSuperAdmin />}>
                    <Route path="/admin/audit" element={<AdminAuditPage />} />
                  </Route>
                </Route>
              </Route>
            </Route>

            <Route path="/design-system" element={<StyleGuidePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </MotionConfig>
  );
}
