# Confort+ — Architecture & Design System

Plateforme de mobilité premium pour Conakry (VTC & moto-taxi), inspirée des standards UX
d'Uber/Bolt/Lyft sans en reprendre l'identité visuelle.

## Statut

**Phase 1 — Design System & Architecture : terminée et validée.**
**Phase 2 — Authentication & Onboarding : terminée et validée.**
**Phase 3 — Passenger application : terminée et validée.**
**Phase 4 — Ride booking : terminée et validée.**
**Phase 5 — Driver application : terminée et validée.**
**Phase 6 — Realtime tracking : terminée et validée.**
**Phase 7 — Payments : terminée et validée.** Correction post-validation (2026-08-11, sur demande explicite) :
Wave retiré de l'app (y compris du type `PaymentMethod`), numéros d'exemple standardisés
620557799 (Orange Money) et 664224466 (MoMo).
**Phase 8 — Notifications & chat : terminée.**
**Phase 9 — Admin dashboard : terminée.**
**Phase 10 — Analytics : terminée.**
**Phase 11 — Security + RLS : terminée.** Sans projet Supabase connecté (aucune
clé fournie — même situation que Mapbox en Phase 6), l'utilisateur a choisi
explicitement de rester sur l'auth mock, renforcée par de vraies fonctionnalités
de sécurité côté client + les politiques RLS documentées prêtes à appliquer
(`docs/RLS_POLICIES.sql`) plutôt que de les faire exécuter contre une base
inexistante.
**Phase 12 — Performance + responsive + accessibilité : terminée.**
**Phase 13 — Testing + production readiness : terminée.**
Les 13 phases de la roadmap initiale sont livrées et validées.

> **Note sur le fournisseur de carte :** la demande initiale nommait Mapbox, mais aucun
> token n'était disponible au moment de la Phase 6. Sur décision explicite de l'utilisateur,
> l'app utilise **MapLibre GL** (API quasi identique à Mapbox GL JS) avec les tuiles
> vectorielles gratuites et sans clé d'OpenFreeMap. Grâce à l'abstraction `MapService`
> prévue dès la Phase 1, un vrai token Mapbox pourra être branché plus tard sans réécrire
> les écrans — voir `src/services/mapService.ts`.

### Phase 2 — ce qui a été livré

- `src/features/auth/` : `authService.ts` (mock login/register/OTP/reset — interface stable pour le futur branchement Supabase Auth en Phase 11), `store.ts` (session Zustand persistée en localStorage), `guards.tsx` (`RequireAuth`, `RedirectIfAuthenticated`, `RootGate`), composants partagés (`AuthLayout`, `OtpInput`, `RoleSelectCard`, `VehicleColorPicker`, `BrandIcons`, `OnboardingIllustrations`)
- Pages : `OnboardingPage` (3 étapes), `WelcomePage`, `LoginPage` (téléphone/email + mot de passe, Google/Apple en attente d'intégration réelle, accès rapide démo 3 rôles), `RegisterPage` (rôle → formulaire, champs véhicule + couleur pour les pilotes), `VerifyEmailPage` (OTP 6 chiffres), `ForgotPasswordPage`, `HomePage` (accueil temporaire post-connexion pour DRIVER/ADMIN, remplacé progressivement par les Phases 5/9)
- Comptes démo intégrés (`DEMO_ACCOUNTS` dans `authService.ts`) : Passager (622000001 — Aïssatou Diallo), Pilote (622001122 — Mamadou Bah), Admin (600000000) — mot de passe démo arbitraire (≥4 caractères)
- Parcours validé de bout en bout dans Chrome (démarrage → onboarding → inscription pilote avec véhicule/couleur → OTP → accueil → déconnexion → connexion démo Admin → garde-fous de redirection → persistance après rechargement)

### Phase 3 — ce qui a été livré

- `src/layouts/AppShell.tsx` : coquille responsive réutilisable (`navItems` en prop) — bottom navigation en mobile (<1024px), sidebar + topbar distincts en desktop (≥1024px, seuil aligné sur le breakpoint Tailwind `lg`). Prévue pour être réutilisée par les espaces chauffeur (Phase 5) et admin (Phase 9) avec leurs propres `navItems`.
- `src/components/ComingSoon.tsx` : remplace un écran vide pour toute fonctionnalité pas encore construite (Notifications → Phase 8, Sécurité → Phase 11), toujours honnête sur la phase concernée plutôt que de laisser un lien mort.
- Espace `/passenger/*` (guardé par `RequirePassenger`) : `PassengerHomePage` (salutation, recherche de destination, actions rapides Domicile/Travail/Récents, aperçu carte Phase 6), `ProfilePage` (avatar, note, menu complet), `PersonalInfoPage` (édition nom/téléphone/email/avatar), `SavedPlacesPage` (CRUD complet sur `src/features/profile/savedPlacesStore.ts`, persisté), `HelpPage` (FAQ statique + contact support)
- `HomeDispatch.tsx` : `/home` aiguille désormais les comptes PASSENGER vers `/passenger`, DRIVER/ADMIN restent sur le placeholder générique
- Parcours desktop validé de bout en bout dans Chrome (connexion démo Passager → navigation sidebar/topbar → Courses en ComingSoon → Profil → ajout et suppression d'un lieu enregistré avec toasts). **Limite connue :** l'environnement de test n'a pas permis de forcer un viewport mobile étroit dans Chrome (`resize_window` sans effet sur le rendu réel) — la bascule bottom-nav n'a donc été vérifiée que par revue de code (le seuil JS `useIsDesktop` à 1024px est identique au breakpoint Tailwind `lg` utilisé pour les classes `lg:hidden`/`lg:*`), pas par capture d'écran réelle en mobile.

### Phase 4 — ce qui a été livré

- `src/data/pricing.ts` étendu avec `calculateRouteEstimate()` : distance/durée indicatives dérivées du même graphe de tronçons que la tarification (pas de routage réel avant Mapbox en Phase 6). `src/data/mockDrivers.ts` (pool de chauffeurs avec couleurs de véhicule variées + `pickDriverFor(category)`), `src/data/mockRides.ts` (historique de démonstration pour le passager démo).
- Flux de réservation hors AppShell (pas de navigation persistante pendant la réservation, comme les apps de référence) : `SearchDestinationPage` (recherche debouncée sur les 12 quartiers desservis, section Récents), `BookingPage` (aperçu d'itinéraire, sélection de catégorie STANDARD/LUXE/VIP/MOTO_SINGLE avec tarifs réels WONKHAI, sélection du moyen de paiement, confirmation), `MatchingPage` (animation de recherche puis carte chauffeur trouvé avec couleur réelle du véhicule, ETA, actions Appeler/Message en ComingSoon Phase 8, Suivre en temps réel en ComingSoon Phase 6, Annuler fonctionnel).
- `/passenger/trips` n'est plus un ComingSoon : `TripsPage` (historique réel) + `RideDetailPage` (`/passenger/trips/:rideId`, détail complet avec note).
- `PassengerHomePage` : la recherche et les raccourcis Domicile/Travail déclenchent désormais une réservation réelle (les lieux enregistrés sont mis en correspondance avec un quartier réservable par le nom de leur adresse — limite assumée tant que le géocodage réel n'existe pas, Phase 6).
- Parcours complet validé de bout en bout dans Chrome : recherche « Dixinn » → sélection → tarifs corrects par catégorie (Standard 3 000 FG, Luxe 2 500 FG, VIP 8 000 FG, Moto-Taxi 15 000 FG) → durée recalculée pour la moto → confirmation → recherche de chauffeur → chauffeur trouvé (TVS HLX 150 rouge, cohérent avec la catégorie Moto-Taxi) → annulation → retour à l'accueil → historique des courses → détail d'une course.

### Phase 5 — ce qui a été livré

- `PersonalInfoPage` et `HelpPage` déplacées de `pages/passenger/` vers `pages/shared/` (composants génériques, indépendants du rôle — réutilisées telles quelles par `/passenger/profile/personal-info` et `/driver/profile/personal-info`). `RequireDriver` (garde de rôle, miroir de `RequirePassenger`). `HomeDispatch` aiguille désormais aussi les comptes DRIVER vers `/driver`.
- `src/features/drivers/rideRequestSimulator.ts` : génère des demandes de course plausibles (passager, trajet, catégorie cohérente avec le type de véhicule du chauffeur, tarif réel WONKHAI) — simulation locale, aucun matching temps réel avec les passagers avant la Phase 6/11. `src/data/mockDriverRides.ts` (historique de démonstration du chauffeur démo).
- Espace `/driver/*` (réutilise `AppShell`, garde `RequireDriver`) : `DriverHomePage` (bascule EN LIGNE/HORS LIGNE, 4 StatCards, simulation de demande entrante avec compte à rebours visuel de 15 s, ACCEPTER/REFUSER — le bouton « Terminer la course » de la Phase 5 a été remplacé en Phase 6 par « Naviguer » vers un vrai suivi cartographique), `DriverTripsPage` (historique), `DriverEarningsPage` (résumé financier, retrait en ComingSoon Phase 7), `DriverProfilePage`, `VehiclePage` (édition véhicule + couleur, réutilise `VehicleColorPicker` de la Phase 2), `DocumentsPage` (4 documents requis, statuts, téléversement simulé).
- **Bug trouvé et corrigé pendant les tests** : basculer hors ligne pendant qu'une demande de course était affichée pouvait laisser la carte affichée malgré le statut hors ligne — un `setTimeout` programmé pendant que le chauffeur était en ligne pouvait s'exécuter après le passage hors ligne (l'onglet du navigateur en arrière-plan retarde les timers, ce qui rend la fenêtre de course possible même si React nettoie normalement l'effet). Corrigé avec un `useRef` qui reflète en continu le statut en ligne, vérifié à l'intérieur des callbacks de `setTimeout` avant de modifier l'état.
- Parcours validé dans Chrome : connexion démo Pilote → navigation Courses/Gains/Profil/Véhicule/Documents (toutes correctes) → passage en ligne → demande entrante générée automatiquement → acceptation → « Terminer la course » → gains et compteur de courses mis à jour correctement (150 000 → 157 500 FG, 0 → 1). **Limite de test :** l'onglet Chrome de cette session automatisée reste en arrière-plan (`document.hidden === true`), ce qui active le throttling des timers du navigateur — la vérification répétée du cycle minuté (demandes toutes les 5 s, expiration à 15 s) a donc été lente et partiellement non déterministe à observer, bien que le comportement métier sous-jacent ait été confirmé correct à plusieurs reprises.

### Phase 6 — ce qui a été livré

- **Fournisseur de carte : MapLibre GL + OpenFreeMap** (gratuit, sans clé) au lieu de Mapbox — décision utilisateur explicite faute de token disponible, voir la note en haut de ce document. `src/components/map/MapView.tsx` est le seul fichier de l'app qui importe `maplibre-gl` (diffing de marqueurs par id, tracé GeoJSON, `fitBounds` automatique). `src/services/mapService.ts` implémente enfin l'abstraction prévue en Phase 1 : routage et géocodage restent basés sur le graphe de quartiers WONKHAI (`src/data/pricing.ts`, nouvelle fonction `getNeighborhoodPath()`), pas sur une vraie Directions API.
- `src/features/rides/useTripSimulation.ts` : simule le déplacement d'un chauffeur (jusqu'au pickup, pause, jusqu'à la destination) en interpolant la position à partir du **temps réel écoulé** (`Date.now()`), pas d'un compteur de ticks — reste correct même si l'onglet est en arrière-plan et que le navigateur throttle les timers (leçon de la Phase 5). Fait progresser le statut à travers la vraie machine d'état `RIDE_STATUS_TRANSITIONS` définie en Phase 1 (DRIVER_ASSIGNED → DRIVER_ARRIVING → DRIVER_ARRIVED → IN_PROGRESS → COMPLETED) — première utilisation réelle de cette machine d'état.
- Accueils passager et chauffeur : le placeholder « Carte Mapbox — Phase 6 » est remplacé par une vraie carte MapLibre avec les véhicules de `src/data/mockDrivers.ts` dispersés sur Conakry, chacun avec la couleur réelle de son véhicule (`src/data/nearbyVehicleMarkers.ts`) — c'est la démonstration directe de la demande initiale « simulation des commandes de voitures en fonction de leur couleur, façon Yango ».
- **Côté passager** : `TrackingPage` (`/passenger/tracking`, plein écran, hors AppShell) — carte avec tracé, marqueur véhicule coloré animé, pins départ/arrivée, panneau chauffeur avec ETA et statut en direct, annulation désactivée une fois le trajet commencé. `RideCompletedPage` (note interactive, commentaire, pourboire). L'historique des courses (`src/data/mockRides.ts`) est devenu `src/features/rides/rideHistoryStore.ts` (Zustand persisté, action `addRide`) pour que les courses simulées apparaissent réellement dans `/passenger/trips`.
- **Côté chauffeur** : `DriverTrackingPage` (`/driver/tracking`), même moteur de simulation vu depuis le chauffeur. Le bouton « Terminer la course » instantané de la Phase 5 est remplacé par « Naviguer », qui ouvre le suivi réel ; la course se termine automatiquement (gains + compteur du jour mis à jour) quand la simulation atteint la destination. `tripsToday` est passé d'un `useState` local (perdu à chaque changement de route) à `src/features/drivers/driverSessionStore.ts` (Zustand non persisté) pour survivre à la navigation entre le dashboard et l'écran de suivi.
- Parcours complet validé de bout en bout dans Chrome, passager **et** chauffeur : recherche → réservation → matching → suivi temps réel sur la vraie carte de Conakry (rues, quartiers, tracé, marqueur coloré en mouvement) → arrivée automatique à l'écran de fin de course → note + pourboire → apparition immédiate dans l'historique. Côté chauffeur : acceptation → « Naviguer » → carte réelle avec passager et tracé → fin de course automatique → gains mis à jour.

### Phase 7 — ce qui a été livré

> **Règle produit respectée à la lettre : « ne pas implémenter de fausses transactions ».**
> Chaque action qui ressemblerait à un vrai mouvement d'argent (rechargement du
> portefeuille, retrait des gains chauffeur) affiche un message honnête indiquant que
> l'intégration réelle (Orange Money / MoMo / Stripe) n'est pas encore branchée, et **ne
> modifie aucun solde**. Seules les données d'historique sont mockées (autorisé
> explicitement par la consigne), jamais une transaction qui prétendrait avoir réussi.

- `src/features/payments/paymentMethodsStore.ts` (moyens de paiement enregistrés — Espèces non supprimable, Orange Money/MoMo/Carte ajoutables, un par défaut ; numéros d'exemple standardisés 620557799 pour Orange Money et 664224466 pour MoMo — Wave a été retiré de l'app sur demande explicite le 2026-08-11), `src/features/payments/walletStore.ts` (solde + historique persistés, seed uniquement), `src/features/payments/payoutRequestsStore.ts` (demandes de retrait chauffeur, statut `PENDING` uniquement).
- `PaymentMethodsPage` (`/passenger/profile/payment-methods`) et `WalletPage` (`/passenger/wallet`) remplacent leurs ComingSoon. Le bouton « Recharger » du portefeuille ouvre un vrai flux (montant, moyen de paiement) mais se termine par le message honnête ci-dessus, sans créditer le solde.
- `DriverEarningsPage` : le bouton « Retirer mes gains » ouvre un vrai formulaire de demande de retrait (montant plafonné aux gains du jour, destination Mobile Money = numéro du chauffeur) qui enregistre une demande `PENDING` affichée dans une liste « Demandes de retrait » — sans jamais débiter `earningsToday` ni simuler un virement réussi.
- Parcours validé dans Chrome, passager et chauffeur : ajout d'un moyen de paiement (Orange Money puis bascule vers Carte bancaire, champ qui s'adapte), tentative de rechargement du portefeuille (solde inchangé, message honnête), demande de retrait chauffeur (50 000 FG envoyés, statut « En attente » affiché, gains du jour inchangés). Un défaut de mise en page repéré pendant le test (numéro de téléphone tronqué à côté du bouton « Définir par défaut ») a été corrigé en repositionnant l'action sous le libellé plutôt qu'à côté.

### Phase 8 — ce qui a été livré

- `src/data/mockNotifications.ts` + `src/features/notifications/notificationsStore.ts` (persisté, seed par compte — 5 notifications passager, 5 chauffeur, tous les types RIDE/PAYMENT/PROMOTION/SECURITY/SYSTEM) ; `pages/shared/NotificationsPage.tsx` (générique, filtrée par `account.id`, icône et couleur par type, indicateur non lu, « Tout marquer comme lu ») remplace les ComingSoon `/passenger/notifications` et `/driver/notifications`.
- **Badge non lus réel sur l'icône cloche de l'`AppShell`** (bottom nav mobile, item de sidebar et bouton de la topbar desktop) — calculé directement depuis `notificationsStore`, pas seulement dans la page : la consigne « utiliser des badges non lus » est respectée à l'endroit où l'utilisateur la voit le plus souvent, la nav persistante.
- `src/features/chat/chatStore.ts` (conversations persistées par `rideId`) + `pages/shared/ChatPage.tsx` (bulles alignées par rôle, messages rapides « Je suis là » / « Où êtes-vous ? » / « Je serai là dans 2 minutes », réponse de l'autre partie simulée après un court délai — aucun backend temps réel avant Supabase Realtime en Phase 11). Branché depuis `MatchingPage` et `TrackingPage` (passager) et `DriverTrackingPage` (chauffeur), avec la conversation ancrée sur `driver.id` ou `request.id` selon le côté.
- Le bouton « Appeler », auparavant un ComingSoon, ouvre désormais un vrai lien `tel:` vers le numéro de l'autre partie — une action honnête et réelle (délègue à l'OS/au téléphone), pas une simulation d'appel connecté. `passengerPhone` a été ajouté à `RideRequest` pour permettre cet appel côté chauffeur.
- Une notification `RIDE` réelle est ajoutée des deux côtés à la fin d'une course (`TrackingPage` et `DriverTrackingPage`), démontrant le badge non lus en usage réel plutôt que sur des données figées.
- Parcours validé dans Chrome : notifications passager (5 affichées, badge rouge visible sur l'icône, disparaît après « Tout marquer comme lu ») ; réservation complète jusqu'au matching puis messagerie (réponse rapide « Où êtes-vous ? » → réponse automatique « D'accord, merci ! » après ~1,5 s → message libre envoyé) — bulles, avatar, horodatage et boutons rapides tous corrects.

### Phase 9 — ce qui a été livré

- `RequireAdmin` (garde de rôle, `guards.tsx`) réserve `/admin/*` aux comptes ADMIN/SUPER_ADMIN. `HomeDispatch` aiguille désormais les trois rôles vers leur propre espace (le `HomePage` générique de la Phase 2 a été supprimé, plus aucun rôle ne l'utilisait). L'`AppShell` accueille jusqu'à 8 sections dans sa bottom nav mobile (contre 5 pour passager/chauffeur) — `overflow-x-auto` + `min-w-[64px] shrink-0` sur chaque item pour défiler proprement sans casser l'usage à 5 items.
- `src/types/admin.ts` (`PlatformUser`, déjà défini en Phase 1 : `SupportTicket`, `AuditLog`, `PlatformKpis`) + jeux de données plateforme indépendants des historiques par rôle : `src/data/mockUsers.ts`, `mockPlatformRides.ts`, `mockPlatformPayments.ts`, `mockSupportTickets.ts`, `platformKpis.ts` (`computePlatformKpis()`, `WEEKLY_TRIPS_SERIES`). `src/components/ui/Table.tsx` (primitives `Table`/`TableHead`/`TableBody`/`TableRow`/`TableHeaderCell`/`TableCell`) devient la base de tous les tableaux admin.
- `src/features/admin/adminStore.ts` : store de modération persisté (utilisateurs, chauffeurs, tickets support) avec `setUserStatus`, `setDriverVerification`, `setTicketStatus`. Le pool de chauffeurs combine le chauffeur démo (`DEMO_DRIVER_ENTRY`) et `MOCK_DRIVERS_POOL`, en excluant `md-1` — même identité fictive que le chauffeur démo (nom, véhicule et plaque identiques), un doublon qui n'était pas visible avant que l'admin ne les liste côte à côte.
- Pages (`src/pages/admin/`, chargées via l'`AppShell` avec `ADMIN_NAV`) : `AdminDashboardPage` (6 StatCards, graphique en barres Recharts des 7 derniers jours conforme au skill `dataviz` — hue de marque unique, coins arrondis, tooltip personnalisé, grille hairline —, aperçu des courses récentes), `AdminUsersPage` (filtres par statut, blocage/déblocage), `AdminDriversPage` (filtres croisant connectivité et vérification, vérifier/suspendre/réactiver), `AdminRidesPage`, `AdminPaymentsPage` (volume réussi, en attente, échouées), `AdminSupportPage` (résoudre/fermer un ticket), `AdminSettingsPage` (fonctionnalités plateforme, grille tarifaire en lecture seule sourcée de `src/data/pricing.ts`, déconnexion). `/admin/analytics` reste un `ComingSoon` pointant vers la Phase 10.
- **Deux bugs de résolution de nom trouvés et corrigés pendant les tests** : après l'exclusion de `md-1` du store admin, l'historique des courses (`AdminRidesPage`) et les tickets support (`AdminSupportPage`) affichaient l'id brut (`md-1`, `demo-driver`) au lieu du nom pour toute course/ticket rattaché à ce chauffeur — corrigé en retombant respectivement sur `MOCK_DRIVERS_POOL` (non filtré) et sur la liste `drivers` du store admin (qui contient bien `demo-driver`) après échec de la recherche côté utilisateurs/store dédupliqué.
- Parcours validé dans Chrome, desktop et mobile : connexion démo Admin → dashboard (KPIs et graphique corrects, vérifiés aussi via le DOM du SVG) → Utilisateurs (filtre + bloquer/débloquer) → Chauffeurs (plus de doublon, vérifier/suspendre/réactiver) → Courses (filtre, noms résolus) → Paiements (Wave absent, montants et icônes crédit/débit corrects) → Support (résoudre un ticket) → Paramètres (déconnexion) → Analytics (ComingSoon Phase 10) → garde-fou confirmé : un compte Passager redirigé hors de `/admin` vers `/passenger`.

### Phase 10 — ce qui a été livré

- `src/data/analytics.ts` : trois fonctions dérivées des données plateforme existantes plutôt que de nouvelles séries inventées à part — `computeRidesByCategory()` (comptage par catégorie, ordre fixe de `RIDE_CATEGORIES_CONFIG`), `computePaymentsByMethod()` (volume `SUCCESS` uniquement par méthode, méthodes absentes des données omises), `computeUserGrowth()` (nouveaux utilisateurs par ancienneté de compte — 5 tranches de `+90j` à `0-14j` — calculées à partir des vraies dates `createdAt` de `mockUsers.ts`, pas d'une série figée séparée).
- `AdminAnalyticsPage.tsx` (remplace le `ComingSoon` de la Phase 9 sur `/admin/analytics`) : 4 graphiques Recharts conformes au skill `dataviz` (courbe de revenu 7 jours, courbe de croissance utilisateurs, barres courses par catégorie, barres volume par méthode de paiement — teinte de marque unique, tooltip personnalisé avec curseur croix pour les courbes, grille hairline) + un tableau « Meilleurs chauffeurs du jour » (classement multi-attributs — note, courses, gains — délibérément un tableau plutôt qu'un graphique, ce format convient mieux quand plusieurs attributs comptent à la fois).
- **Bug trouvé et corrigé pendant les tests** : le premier repère de l'axe X de la courbe « Croissance des utilisateurs » (`+90j`) n'apparaissait pas du tout dans le DOM — pas un artefact de capture d'écran cette fois, vérifié directement via `document.querySelectorAll('svg.recharts-surface text')`. Cause : la largeur de l'axe Y (32px) combinée à la marge gauche négative du graphique ne laissait que ~12px avant l'origine du tracé, insuffisant pour que Recharts rende le premier repère d'une courbe (contrairement aux graphiques en barres, où l'espacement inter-catégories donne naturellement de la marge à la première catégorie). Corrigé en élargissant l'axe Y à 48px et en ajoutant un `padding` de 16px de chaque côté de l'axe X sur les deux graphiques en courbe. **Leçon pour tout futur graphique en courbe dans cette app : vérifier le premier ET le dernier repère via le DOM, pas seulement à l'œil sur une capture — un axe Y trop étroit combiné à une marge négative agressive peut faire disparaître silencieusement un repère de bord.**
- Parcours validé dans Chrome, desktop (1400px, grille 2 colonnes) et mobile (bottom nav) : les 4 graphiques affichent les bonnes valeurs (vérifiées via le DOM SVG, pas seulement visuellement), tooltip + curseur croix fonctionnels sur les courbes, survol qui éclaire la barre visée sur les graphiques en barres, tableau des meilleurs chauffeurs correct (pas de doublon, cohérent avec la Page Chauffeurs de la Phase 9).

### Phase 11 — ce qui a été livré

> **Décision d'architecture explicite** (même schéma que Mapbox → MapLibre en
> Phase 6) : cette phase était initialement scopée pour brancher Supabase Auth
> réel, en s'appuyant sur l'interface stable d'`authService.ts` conçue depuis
> la Phase 2 pour ce remplacement sans réécrire aucune page. Sans clé Supabase
> disponible, l'utilisateur a validé rester sur l'auth mock, en ajoutant de
> vraies fonctionnalités de sécurité par-dessus et en documentant les
> politiques RLS prêtes à appliquer plutôt que de les exécuter dans le vide.

- `RequireSuperAdmin` (`guards.tsx`) réserve les routes sensibles aux comptes SUPER_ADMIN — un ADMIN standard est renvoyé vers `/admin`, pas vers `/home` (il reste dans son espace, contrairement à un rôle complètement étranger). Nouveau 4ᵉ compte démo **Super Admin** (Founé Camara, `authService.ts`) pour pouvoir tester la distinction ADMIN/SUPER_ADMIN sans les deux rôles réels.
- **Journal d'audit** (`AdminAuditPage.tsx`, `/admin/audit`, visible uniquement dans la nav admin pour un SUPER_ADMIN) : utilise enfin le type `AuditLog` défini en Phase 1 et resté inutilisé jusqu'ici — même schéma que `RIDE_STATUS_TRANSITIONS` (Phase 6) et `AppNotification`/`ChatMessage` (Phase 8), un rappel à vérifier les types déjà définis avant d'en modéliser de nouveaux. `adminStore.ts` journalise automatiquement chaque action de modération (`setUserStatus`, `setDriverVerification`, `setTicketStatus`) avec l'auteur réellement connecté lu depuis `useAuthStore.getState()`, jamais un paramètre fourni par l'appelant — pour qu'aucune action ne puisse oublier de se journaliser.
- **`pages/shared/SecurityPage.tsx`** (`/passenger/profile/security` et `/driver/profile/security`, remplace les deux `ComingSoon` qui promettaient explicitement « Phase 11 — Security & RLS » depuis la Phase 3/5) : changement de mot de passe (honnête — aucun champ mot de passe n'existe réellement dans le modèle de données mock, donc le formulaire valide et affiche un message honnête plutôt qu'un faux succès, même principe que le rechargement de portefeuille en Phase 7), authentification à deux facteurs (bascule réelle et persistée, `src/features/security/securityStore.ts`), sessions actives avec révocation réelle, suppression de compte en **demande** journalisée (`requestDeletion`) sans jamais supprimer réellement — encore le même principe que les demandes de retrait chauffeur de la Phase 7 : logger une vraie requête `PENDING`, ne jamais simuler un succès instantané pour une action irréversible.
- **`docs/RLS_POLICIES.sql`** : schéma Postgres + politiques RLS complètes pour les 4 rôles (PASSENGER/DRIVER/ADMIN/SUPER_ADMIN), table par table (`profiles`, `driver_profiles` + vue publique sans `earnings_today`, `rides`, `transactions`/`payout_requests`, `support_tickets`, `audit_logs` réservé SUPER_ADMIN, `notifications`, `chat_messages`, `saved_places`) — non exécuté (aucune base réelle), prêt à appliquer tel quel le jour où Supabase est branché.
- Parcours validé dans Chrome : connexion Super Admin → item « Journal » visible dans la nav (absent pour un ADMIN standard) → action de modération → apparition immédiate dans le journal avec le bon auteur → connexion ADMIN standard → tentative directe sur `/admin/audit` → redirigé vers `/admin` (RequireSuperAdmin fonctionne) → page Sécurité passager : validation du mot de passe (champs différents rejetés), bascule 2FA, révocation d'une session, demande de suppression (bouton remplacé par la confirmation d'envoi) → page Sécurité chauffeur : état indépendant du passager confirmé (2FA et sessions ne sont pas partagés entre comptes).

### Phase 12 — ce qui a été livré

Phase d'audit et de renforcement (comme la Phase 11), pas de nouvelles fonctionnalités.

- **Performance** : `App.tsx` charge désormais chaque page via `React.lazy()` + un `Suspense` unique — avant cette phase, les ~35 pages étaient importées en dur, d'où l'avertissement Vite « > 500 kB » présent à chaque build depuis la Phase 9. Le chunk d'entrée principal est passé d'un seul bundle ~1,8 Mo à 326 Ko (103 Ko gzip) ; les deux gros chunks restants (MapLibre GL ~806 Ko, Recharts ~369 Ko) sont désormais correctement différés aux seules routes qui les utilisent (écrans carte, analytics admin) plutôt que de bloquer le chargement initial. `Avatar` charge ses images en `loading="lazy" decoding="async"` (pages admin à listes denses d'avatars).
- **Accessibilité** : lien « Aller au contenu » + repère `id="main-content" tabIndex={-1}` dans `AppShell` (mobile et desktop), `aria-label` sur les deux `<nav>`, `MotionConfig reducedMotion="user"` à la racine (Framer Motion ne respecte pas `prefers-reduced-motion` automatiquement — la règle CSS déjà présente depuis la Phase 1 ne couvrait que les transitions CSS, pas les animations `motion.*`), `BottomSheet` reçoit désormais Échap-pour-fermer + `role="dialog"` (composant exporté mais pas encore utilisé dans une page réelle — renforcé par anticipation, même schéma que `Modal`), anneaux de focus (`focus-visible`) ajoutés aux chips de filtre (5 pages admin) et au composant Switch (3 fichiers) qui n'en avaient pas. **Vrai échec de contraste WCAG trouvé** : le texte du badge `warning` (~3,15:1 sur blanc) échouait le minimum AA de 4,5:1 pour du texte, utilisé comme libellé de statut réel sur 4+ pages admin — corrigé par un nouveau token `--warning-strong` (~5,6:1) dédié au texte du badge, sans toucher `--warning` lui-même (utilisé aussi pour les étoiles de notation, où la teinte plus claire reste correcte).
- **Responsive** : le seuil de bascule de l'`AppShell` (1024px) n'avait été vérifié visuellement qu'en mobile (~390-767px) et desktop (~1387-1400px) — jamais exactement à la frontière. **Vrai bug trouvé à 1024-1200px** : les tableaux admin faisaient déborder la page entière horizontalement au lieu de faire défiler uniquement le conteneur `overflow-x-auto` du composant `Table` — un bug classique de flexbox (« min-width: auto ») où la colonne de contenu à côté de la barre latérale ne pouvait pas rétrécir sous la largeur intrinsèque de son plus large descendant. Corrigé par un seul `min-w-0` sur ce conteneur flex dans `AppShell.tsx` — un correctif unique au niveau de la coquille partagée qui bénéficie à toutes les pages à tableau (passager/chauffeur/admin), pas un correctif par page. Vérifié via `document.body.scrollWidth`/`clientWidth` (égaux après correction), pas seulement une capture d'écran.

### Phase 13 — ce qui a été livré

- **Tests** : infrastructure Vitest + React Testing Library (`npm run test`), inexistante avant cette phase. Les tests ciblent délibérément la logique et les frontières qui ont déjà produit de vrais bugs pendant les phases précédentes plutôt qu'une couverture superficielle : `src/data/pricing.test.ts` (grille tarifaire WONKHAI — trajets adjacents, cumul de tronçons, transit par Kaloum entre deux axes), `src/utils/format.test.ts`, `src/features/admin/adminStore.test.ts` (protège la déduplication `md-1`/`demo-driver` et le journal d'audit — exactement les deux bugs trouvés manuellement en Phase 9/11), `src/features/auth/guards.test.tsx` (les frontières de rôle renforcées en Phase 11, y compris `RequireSuperAdmin` qui redirige vers `/admin` et non `/home`), et un test de fumée sur `Button` pour prouver que la configuration RTL fonctionne de bout en bout sur un vrai composant.
- **Robustesse** : `src/components/ErrorBoundary.tsx` (composant classe, seule API capable d'intercepter une exception de rendu) enveloppe désormais toute l'app dans `main.tsx` — avant cette phase, une exception non gérée dans n'importe quelle page faisait disparaître tout l'arbre React sans message. `NotFoundPage.tsx` + route `"*"` gèrent enfin les URL inconnues (auparavant : page blanche).
- **Nettoyage** : `@google/genai` et le câblage `GEMINI_API_KEY` dans `vite.config.ts` — restes de l'échafaudage Google AI Studio d'origine, jamais utilisés par une seule ligne de Confort+ — ont été supprimés (37 paquets en moins). `README.md` (qui ne parlait que de Gemini et ne mentionnait jamais Confort+) et `metadata.json` réécrits avec la bonne identité du projet.
- **PWA** : `public/manifest.json` ajouté (nom, icône, `theme_color`, `display: standalone`) pour donner un sens réel à la mention « PWA-ready » de ce document — pas de service worker à ce stade, l'app n'est donc pas installable hors-ligne, seulement « manifeste correct ».
- Parcours validé : suite de tests complète (34/34), build de production propre, navigation vers une URL inconnue → `NotFoundPage` → « Retour à l'accueil » → `RootGate` renvoie correctement vers l'espace du rôle connecté.

### Mobile-first + PWA installable — ce qui a été livré

*Correction de la note Phase 13 ci-dessus : ce n'est plus vrai.* `vite-plugin-pwa` génère désormais un vrai service worker (précache l'app shell + les images `public/assets/`, sans mise en cache des tuiles carte externes — pas de fausse promesse de carte hors-ligne), un manifest complet avec de vraies icônes PNG (192/512/maskable, plus `apple-touch-icon` dédié pour iOS) dérivées du logo réellement utilisé en production. L'app est installable sur écran d'accueil (Android/Chrome et iOS/Safari). Gestes tactiles (pincer-zoomer, déplacement au doigt) activés sur toutes les cartes plein écran ; `env(safe-area-inset-top/bottom)` respecté par les contrôles flottants (boutons retour, contrôles carte, pastilles de statut) en plus de la navigation basse déjà couverte.

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS (build-time, tokens CSS variables) + conventions shadcn/ui (`components.json`)
- Lucide Icons, Framer Motion, class-variance-authority, sonner (toasts)
- react-router-dom (routage), zustand (state, à brancher dès Phase 2)
- MapLibre GL + tuiles OpenFreeMap (voir Phase 6 — Mapbox pourra être branché plus tard via un token, sans changer les écrans)
- Supabase (auth / base de données / realtime) — client dans `src/services/supabaseClient.ts`
- Mapbox — jamais importé directement par les features, toujours via `src/services/mapService.ts`
- Vitest + React Testing Library (`npm run test`) — Phase 13
- Manifeste web app (`public/manifest.json`, Phase 13) ; pas de service worker à ce stade, responsive mobile-first

## Origine du projet

Ce dépôt remplace progressivement le prototype **WONKHAI** (`App.tsx` à la racine, monolithique,
~1900 lignes, Tailwind via CDN). Les fichiers historiques (`App.tsx`, `components/`, `views/`,
`services/`, `types.ts` à la racine) sont conservés tels quels — ils ne sont plus importés par le
nouveau point d'entrée (`index.html` → `src/main.tsx`) mais restent disponibles comme référence
métier tant que chaque fonctionnalité n'a pas été reconstruite dans `src/`.

**Important : la grille tarifaire de WONKHAI est la source de vérité.** Elle a été portée à
l'identique dans `src/data/pricing.ts` (mêmes quartiers, mêmes prix par tronçon, mêmes formules
de catégorie : LUXE = STANDARD − 500 FG, VIP = STANDARD + 5 000 FG, MOTO_SINGLE = STANDARD × 5).
Toute évolution tarifaire doit passer par ce fichier, pas par une réécriture ad hoc dans une page.

## Structure

```
src/
├── components/
│   └── ui/          # Primitives réutilisables (Button, Card, Input, Modal, BottomSheet…)
├── pages/           # Composition des routes à partir des features
├── layouts/         # Bottom nav (mobile) / sidebar (desktop) — Phase 3+
├── features/
│   ├── auth/         # Phase 2
│   ├── rides/         # Phase 4, 6
│   ├── drivers/        # Phase 5
│   ├── payments/       # Phase 7
│   ├── notifications/    # Phase 8
│   ├── profile/        # Phase 3
│   └── admin/          # Phase 9-10
├── hooks/           # useMediaQuery, useDebounce…
├── services/         # mapService (abstraction), supabaseClient
├── lib/             # utils.ts (cn — fusion de classes Tailwind)
├── types/            # Types métier partagés (User, Driver, Ride, Payment…)
├── utils/            # Fonctions pures (formatFare, formatDistance…)
├── data/             # Quartiers Conakry, tarification, couleurs véhicules
└── styles/            # globals.css — tokens de design (CSS variables)
```

## Design tokens

Palette de marque à trois couleurs, comme demandé : **bleu nuit** (primary), **vert profond**
(secondary), **blanc** (background). Échelles complètes 50→950 définies en HSL dans
`src/styles/globals.css` et exposées via `tailwind.config.ts`. Couleurs sémantiques
(success/warning/danger/info) dérivées séparément pour ne pas polluer la palette de marque.

Une **seconde palette**, indépendante, existe pour les couleurs réelles des véhicules
(`src/data/vehicleColors.ts`) : blanc, noir, gris, argent, rouge, bleu, vert, beige — utilisée
pour représenter chaque voiture/moto sur la carte avec sa vraie couleur (marqueurs), à la manière
de Yango sur Dakar. Ce sera branché sur les marqueurs Mapbox en Phase 6.

Typographie : **Manrope** (titres, 600-800) / **Inter** (texte courant, 400-600).

## MapService — abstraction cartographique

`src/services/mapService.ts` définit l'interface `MapService` (routage, géocodage,
géocodage inverse) sans dépendre d'un fournisseur. Implémentée en Phase 6 avec MapLibre GL
(routage/géocodage basés sur le graphe de quartiers WONKHAI). Aucune feature ne doit importer
`maplibre-gl` directement — seul `src/components/map/MapView.tsx` le fait. Un provider Mapbox
réel pourra être ajouté plus tard (token à fournir) en implémentant la même interface.

## Roadmap (13 phases)

1. **Design System + architecture** ✅
2. **Authentication + onboarding** ✅
3. **Passenger application (profil, lieux enregistrés, layout mobile/desktop)** ✅
4. **Ride booking (recherche, choix du service, estimation)** ✅
5. **Driver application (dashboard, demandes de course)** ✅
6. **Realtime tracking (MapLibre, couleurs de véhicules en direct)** ✅
7. **Payments (Orange Money, MoMo, carte — mock tant que non intégré)** ✅
8. **Notifications + chat** ✅
9. **Admin dashboard** ✅
10. **Analytics (Recharts)** ✅
11. **Security + RLS (rôles PASSENGER/DRIVER/ADMIN/SUPER_ADMIN)** ✅
12. **Performance + responsive + accessibilité** ✅
13. **Testing + production readiness** ✅

## Comment valider

```
npm install
npm run dev
```

Le port configuré est **5180** (`vite.config.ts`, `strictPort: true`) — 3000 et 5173, les ports
habituels, sont déjà occupés par d'autres projets Node sur cette machine. Si 5180 est lui aussi
pris ailleurs, changez `server.port` dans `vite.config.ts` ; `strictPort: true` fait échouer le
démarrage bruyamment plutôt que de basculer silencieusement sur un autre port.

- `/` aiguille automatiquement vers l'onboarding (première visite), l'accueil (si connecté) ou
  l'écran de bienvenue.
- Parcours à tester : Onboarding → Créer un compte → Pilote → remplir le formulaire (couleur de
  véhicule incluse) → code OTP affiché en mode démo → Accueil. Ou : Se connecter → Accès rapide
  démo → Passager / Pilote / Admin / Super Admin.
- `/design-system` reste accessible directement pour revoir la vitrine Phase 1.
- `npm run test` lance la suite de tests (Vitest + React Testing Library, Phase 13).
