# Confort+ — Audit UI/UX complet

**Phase : AUDIT UNIQUEMENT — aucune modification de code n'a été effectuée pour produire ce document.**
Ce rapport analyse l'état réel du code existant (rien n'est inventé) en vue d'une refonte UI/UX
visant un niveau de qualité comparable aux meilleures apps de mobilité (Uber, Yango) — sans les
copier, en construisant une identité propre à Confort+.

Date de l'audit : 2026-08-12. Portée : ~41 écrans réels (17 passager, 7 chauffeur, 9 admin, 8
auth/onboarding), les fondations du design system (`src/styles/globals.css`,
`tailwind.config.ts`, `src/components/ui/*`), et l'architecture applicative.

**Score moyen global : 6.5/10** (Passager 6.7 · Chauffeur 6.3 · Admin 6.2 · Auth/Onboarding 6.4)

---

## Table des matières

1. [Architecture actuelle](#1-architecture-actuelle)
2. [Écrans existants](#2-écrans-existants)
3. [Audit écran par écran](#3-audit-écran-par-écran)
4. [Problèmes UX transversaux](#4-problèmes-ux-transversaux)
5. [Problèmes UI transversaux](#5-problèmes-ui-transversaux)
6. [Design System recommandé](#6-design-system-recommandé)
7. [Composants à créer](#7-composants-à-créer)
8. [Composants à refactoriser](#8-composants-à-refactoriser)
9. [Parcours utilisateur cible](#9-parcours-utilisateur-cible)
10. [Roadmap de refonte](#10-roadmap-de-refonte)

---

## 1. Architecture actuelle

### Stack

- **React 19.2.1** + **TypeScript** (strict) + **Vite 6** — SPA, pas de SSR.
- **React Router 7** (`BrowserRouter`), toutes les pages chargées via `React.lazy()` +
  `Suspense` (code-splitting par route, un seul chunk par page).
- **Tailwind CSS 3.4.17** (build-time, pas de JIT runtime), tokens exposés via CSS variables
  (`src/styles/globals.css`) et mappés dans `tailwind.config.ts`. Conventions proches de
  shadcn/ui (`components.json` présent) mais **shadcn/ui lui-même n'est pas installé** — les
  composants de `src/components/ui/` sont écrits à la main, pas générés.
- **Zustand 5** pour l'état global — un store par domaine, la majorité avec le middleware
  `persist` (localStorage) : `authStore`, `adminStore`, `notificationsStore`, `chatStore`,
  `walletStore`, `paymentMethodsStore`, `payoutRequestsStore`, `rideHistoryStore`,
  `savedPlacesStore`, `securityStore`, `driverSessionStore` (non persisté).
- **MapLibre GL 4.7** + tuiles vectorielles gratuites OpenFreeMap — pas Mapbox (voir note
  ci-dessous). Un seul fichier, `src/components/map/MapView.tsx`, importe `maplibre-gl`.
- **Recharts 3.5** pour les graphiques admin (Dashboard, Analytics).
- **Framer Motion 11** pour les animations (Modal, BottomSheet, onboarding, transitions de
  matching), avec `MotionConfig reducedMotion="user"` au niveau racine.
- **class-variance-authority** pour les variantes de composants (`Button`, `Badge`).
- **sonner** pour les toasts.
- **Vitest 4 + React Testing Library** — infrastructure de test existante mais très partielle
  (34 tests, quasiment tous sur la logique métier — pricing, guards, adminStore — un seul test
  de composant UI, `Button.test.tsx`).

> **Note fournisseur de carte :** la demande d'origine du projet nommait Mapbox, mais aucun
> token n'a jamais été disponible ; l'équipe a basculé sur MapLibre GL + OpenFreeMap (API quasi
> identique) via une abstraction `src/services/mapService.ts`. Un vrai token Mapbox pourrait être
> branché plus tard sans réécrire les écrans consommateurs.

### Aucun backend réel connecté

**Tout est mocké côté client.** `src/features/auth/authService.ts` simule login/register/OTP avec
un délai artificiel (700ms) et 4 comptes démo (Passager/Pilote/Admin/Super Admin). Il n'y a
**aucun appel réseau réel** nulle part dans l'app — `src/services/supabaseClient.ts` existe comme
point de branchement futur mais n'est appelé par aucune feature. Conséquence directe pour l'audit
UI/UX : **aucun écran ne peut aujourd'hui présenter un vrai état de chargement réseau ni une vraie
erreur réseau**, ce qui explique pourquoi les composants `Skeleton`/`ErrorState` du design system
existent mais ne sont quasiment jamais utilisés en pratique (voir section 4).

### Routing (`src/App.tsx`)

Trois espaces protégés par des guards de rôle (`RequirePassenger`, `RequireDriver`,
`RequireAdmin`, `RequireSuperAdmin`), plus un tronc commun d'authentification
(`RedirectIfAuthenticated`) et un point d'entrée unique post-connexion (`/home` →
`HomeDispatch` → redirection selon le rôle). Deux routes de réservation (`/passenger/search`,
`/passenger/booking`, `/passenger/booking/matching`, `/passenger/tracking`,
`/driver/tracking`) sont **hors du layout `AppShell`** (pas de nav persistante pendant une
réservation active), un choix assumé et cohérent avec les apps de référence. Route `*` →
`NotFoundPage`. `/design-system` reste accessible en dehors de toute authentification (vitrine
interne, voir section 3).

`AppShell` (`src/layouts/AppShell.tsx`) est le layout partagé par les 3 espaces authentifiés :
bottom nav sticky sur mobile (`overflow-x-auto`, jusqu'à 8 items pour l'admin), sidebar fixe +
top bar sur desktop (seuil `min-width: 1024px`). Bon socle d'accessibilité (skip-link,
`aria-label` sur les nav, badge de notification cohérent) — voir détail section 3.

### Données & logique métier

- `src/data/pricing.ts` — la grille tarifaire (source de vérité portée depuis le prototype
  WONKHAI), calcul de trajet par graphe de quartiers (`src/data/neighborhoods.ts`, 12 quartiers de
  Conakry desservis).
- `src/data/mock*.ts` — jeux de données de démonstration statiques (utilisateurs, chauffeurs,
  courses, paiements, tickets, journal d'audit, notifications).
- `src/types/*.ts` — modèle de données TypeScript complet (User, Driver, Ride, Transaction,
  Notification, etc.), bien structuré et cohérent avec ce qu'affichent réellement les écrans.

### Tests

Vitest configuré (`vite.config.ts`), `npm run test`. Couverture actuelle : logique métier
(pricing, guards de rôle, adminStore) et un seul composant UI. **Aucun test de régression visuelle
ni de comportement pour `Modal`, `BottomSheet`, `Input`, ni pour aucune page** — un vrai risque
pour la refonte à venir, qui devra s'appuyer sur des tests pour ne pas régresser silencieusement.

---

## 2. Écrans existants

Cartographie exhaustive — **uniquement ce qui existe réellement dans `src/pages/` et est routé
dans `src/App.tsx`**. Aucun écran fictif n'est listé ci-dessous.

### PASSAGER (12 écrans dédiés + 5 partagés)

| Écran demandé | Écran réel | Fichier |
|---|---|---|
| Landing | *(n'existe pas séparément — voir Onboarding/Welcome)* | — |
| Login | Login | `pages/LoginPage.tsx` |
| Register | Register | `pages/RegisterPage.tsx` |
| Home | Accueil | `pages/passenger/PassengerHomePage.tsx` |
| Destination / Recherche | Recherche destination | `pages/passenger/SearchDestinationPage.tsx` |
| Carte | *(intégrée à Home/Tracking, pas d'écran dédié)* | — |
| Choix du service / Pricing / Paiement | Réservation (les 3 fusionnés) | `pages/passenger/BookingPage.tsx` |
| Recherche chauffeur / Chauffeur trouvé | Matching (les 2 fusionnés) | `pages/passenger/MatchingPage.tsx` |
| Confirmation | *(pas d'écran séparé — fait partie de Booking)* | — |
| Tracking / Course en cours | Suivi (les 2 fusionnés) | `pages/passenger/TrackingPage.tsx` |
| Course terminée / Notation | Course terminée (les 2 fusionnés) | `pages/passenger/RideCompletedPage.tsx` |
| Reçu | Détail de course | `pages/passenger/RideDetailPage.tsx` |
| Historique | Historique | `pages/passenger/TripsPage.tsx` |
| Wallet | Portefeuille | `pages/passenger/WalletPage.tsx` |
| — | Moyens de paiement | `pages/passenger/PaymentMethodsPage.tsx` |
| Profil | Profil | `pages/passenger/ProfilePage.tsx` |
| — | Lieux enregistrés | `pages/passenger/SavedPlacesPage.tsx` |
| Notifications | Notifications *(partagé)* | `pages/shared/NotificationsPage.tsx` |
| Sécurité | Sécurité *(partagé)* | `pages/shared/SecurityPage.tsx` |
| — | Infos personnelles *(partagé)* | `pages/shared/PersonalInfoPage.tsx` |
| — | Aide *(partagé)* | `pages/shared/HelpPage.tsx` |
| — | Messagerie *(partagé)* | `pages/shared/ChatPage.tsx` |

### CHAUFFEUR (7 écrans dédiés + réutilise les 5 partagés ci-dessus)

| Écran demandé | Écran réel | Fichier |
|---|---|---|
| Login | *(partagé avec passager, un seul flux d'auth)* | `pages/LoginPage.tsx` |
| Dashboard / Disponibilité / Demandes | Accueil chauffeur (les 3 fusionnés) | `pages/driver/DriverHomePage.tsx` |
| Course acceptée | *(pas d'écran séparé — état interne de DriverHomePage)* | — |
| Navigation / Course en cours | Suivi chauffeur (les 2 fusionnés) | `pages/driver/DriverTrackingPage.tsx` |
| Course terminée | *(pas d'écran dédié — retour auto à DriverHomePage)* | — |
| Revenus | Gains | `pages/driver/DriverEarningsPage.tsx` |
| Historique | Historique chauffeur | `pages/driver/DriverTripsPage.tsx` |
| Profil | Profil chauffeur | `pages/driver/DriverProfilePage.tsx` |
| — | Véhicule | `pages/driver/VehiclePage.tsx` |
| — | Documents | `pages/driver/DocumentsPage.tsx` |

### ADMIN (9 écrans)

| Écran demandé | Écran réel | Fichier |
|---|---|---|
| Dashboard | Dashboard | `pages/admin/AdminDashboardPage.tsx` |
| Utilisateurs | Utilisateurs | `pages/admin/AdminUsersPage.tsx` |
| Chauffeurs | Chauffeurs | `pages/admin/AdminDriversPage.tsx` |
| Véhicules | *(fusionné dans Chauffeurs, pas d'écran séparé)* | — |
| Courses | Courses | `pages/admin/AdminRidesPage.tsx` |
| Paiements | Paiements | `pages/admin/AdminPaymentsPage.tsx` |
| Tarification | *(lecture seule uniquement, fusionné dans Paramètres)* | `pages/admin/AdminSettingsPage.tsx` |
| Zones | *(n'existe pas)* | — |
| Notifications | Notifications *(partagé)* | `pages/shared/NotificationsPage.tsx` |
| Réclamations | Support (tickets) | `pages/admin/AdminSupportPage.tsx` |
| Analytics | Analytics | `pages/admin/AdminAnalyticsPage.tsx` |
| Paramètres | Paramètres | `pages/admin/AdminSettingsPage.tsx` |
| — | Journal d'audit (Super Admin uniquement) | `pages/admin/AdminAuditPage.tsx` |

### AUTH / ONBOARDING (transversal, avant choix de rôle)

| Écran | Fichier |
|---|---|
| Onboarding (3 slides) | `pages/OnboardingPage.tsx` |
| Bienvenue | `pages/WelcomePage.tsx` |
| Connexion | `pages/LoginPage.tsx` |
| Inscription (2 étapes) | `pages/RegisterPage.tsx` |
| Vérification OTP | `pages/VerifyEmailPage.tsx` *(nommage trompeur — vérifie un téléphone, pas un email, voir 3.4)* |
| Mot de passe oublié | `pages/ForgotPasswordPage.tsx` |
| 404 | `pages/NotFoundPage.tsx` |
| Routeur post-connexion (pas un écran) | `pages/HomeDispatch.tsx` |
| Vitrine design system (dev, hors auth) | `pages/StyleGuidePage.tsx` |

**Écarts constatés avec la demande initiale** (aucune fabrication — écarts réels du code) :
pas de Landing marketing distincte de l'onboarding, pas d'écran Carte autonome, pas d'écran
Confirmation séparé, pas d'écran "Course acceptée" ni "Course terminée" dédiés côté chauffeur, pas
d'écran admin Zones, pas d'écran admin Véhicules ni Tarification éditable séparés.

---

## 3. Audit écran par écran

Chaque écran a été lu intégralement et noté sur 10 avec justification factuelle. Les rapports
complets (hiérarchie visuelle, CTA, états gérés, spacing, couleurs, responsive, accessibilité,
problèmes UX/UI) sont regroupés ci-dessous par espace.

### 3.1 Écrans Passager & partagés — moyenne 6.7/10

*(Auditeur : agent dédié, lecture intégrale de 17 fichiers)*

#### Accueil Passager — `src/pages/passenger/PassengerHomePage.tsx` — **6/10**
Barre de recherche et raccourcis bien mis en avant ; carte reléguée en `Card` statique `h-48`,
peu immersive. `if (!account) return null;` → écran blanc silencieux sans `Skeleton`. Aucun accès
notifications/profil visible en desktop dans ce fichier. Titre "Bonjour, {prénom}" en `<p>` au
lieu de `<h1>`, casse la hiérarchie de titres pour les lecteurs d'écran.

#### Recherche destination — `src/pages/passenger/SearchDestinationPage.tsx` — **6.5/10**
`EmptyState` bien géré. Origine figée sur "Position actuelle (**simulée**)" — texte de
développement visible en interface finale, non modifiable par l'utilisateur. Aucune classe
responsive desktop (`max-w-md` figé), incohérent avec d'autres écrans du même flux.

#### Réservation (service + tarif + paiement) — `src/pages/passenger/BookingPage.tsx` — **5.5/10**
CTA de confirmation bien conçu (prix dynamique intégré). Bandeau carte = placeholder statique
avec le texte **"carte réelle en Phase 6"** exposé à l'utilisateur final. Sélection
catégorie/paiement non annoncée comme groupe de choix exclusif pour l'accessibilité (pas de
`role="radio"`/`aria-pressed`). Aucune classe responsive desktop sur un écran de conversion
pourtant critique.

#### Recherche chauffeur + Chauffeur trouvé — `src/pages/passenger/MatchingPage.tsx` — **7/10**
Un des écrans les mieux animés de l'app (pulsation Framer Motion). Bonne hiérarchie d'actions
(Suivre en primary, Annuler en danger/ghost). Aucun `aria-live` sur la transition recherche→match
trouvé ; animation infinie sans respect strict de `prefers-reduced-motion` au niveau du composant
lui-même ; aucune gestion d'échec de matching.

#### Tracking (course en cours) — `src/pages/passenger/TrackingPage.tsx` — **7/10**
L'écran le plus proche du standard Uber/Yango (carte plein écran + overlay statut + bottom
sheet). Couleurs de marqueurs de carte hardcodées en hex (`#1B6854`, `#0F2A4D`) au lieu des
tokens. Pas de `aria-live` sur le changement de statut automatique. Aucun moyen de
minimiser/revenir à l'accueil sans annuler la course.

#### Course terminée + Notation — `src/pages/passenger/RideCompletedPage.tsx` — **6/10**
Séquence de lecture bien construite. Note par défaut silencieusement fixée à 5 étoiles
(`useState(5)`) — biais de notation implicite si l'utilisateur ne touche pas au widget.
Redirection automatique forcée après 900ms, trop rapide pour relire la confirmation. Champ
commentaire en `Input` une ligne au lieu d'un `Textarea`.

#### Historique — `src/pages/passenger/TripsPage.tsx` — **7/10**
`EmptyState` bien implémenté, un des rares écrans avec un minimum de responsive desktop
(`lg:max-w-2xl`). Aucun filtre/recherche ni pagination.

#### Détail/reçu de course — `src/pages/passenger/RideDetailPage.tsx` — **6.5/10**
`EmptyState` géré pour "Course introuvable". Écran purement consultatif : aucune action
possible (pas de réclamation, pas de reçu téléchargeable, pas de "refaire cette course") —
retrait net par rapport aux standards du secteur sur un écran de service après-vente.

#### Portefeuille — `src/pages/passenger/WalletPage.tsx` — **6/10**
Carte solde bien mise en avant, bon contraste. Le CTA "Recharger" est pleinement actif
visuellement (modale complète, sélection de montant) mais aboutit systématiquement à un toast
d'indisponibilité — fonctionnalité centrale factice présentée comme opérationnelle.

#### Moyens de paiement — `src/pages/passenger/PaymentMethodsPage.tsx` — **6.5/10**
CRUD de base bien exécuté. Suppression d'un moyen de paiement **sans confirmation**, incohérent
avec `SecurityPage` qui, elle, implémente une confirmation en deux étapes. Pas d'`EmptyState` si
la liste est vide (incohérence avec le reste de l'app).

#### Profil — `src/pages/passenger/ProfilePage.tsx` — **7/10**
Structure simple et efficace. Même pattern d'écran blanc silencieux sans compte chargé. Pas de
raccourci direct vers le Wallet depuis le menu.

#### Lieux enregistrés — `src/pages/passenger/SavedPlacesPage.tsx` — **7/10**
Le meilleur traitement d'`EmptyState` de tout l'audit (CTA intégré à l'état vide). Suppression
sans confirmation (même lacune que Moyens de paiement). Bug latent : un lieu personnalisé ajouté
est toujours associé à `CONAKRY_MAP_CENTER` comme coordonnées, sans lien réel avec un quartier
réservable.

#### Informations personnelles *(partagé)* — `src/pages/shared/PersonalInfoPage.tsx` — **6.5/10**
Formulaire propre. Bouton d'édition d'avatar sans `aria-label` (icône caméra seule). Aucune
validation de format email/téléphone. État `loading` cosmétique — aucune opération asynchrone
réelle derrière.

#### Aide *(partagé)* — `src/pages/shared/HelpPage.tsx` — **7/10**
Bon usage du HTML sémantique natif (`<details>/<summary>` pour l'accordéon FAQ — accessibilité
clavier native gratuite, rare dans le reste du code). CTA "Contacter le support" entièrement
factice (toast d'indisponibilité).

#### Notifications *(partagé)* — `src/pages/shared/NotificationsPage.tsx` — **7.5/10**
Un des écrans les mieux traités : différenciation lu/non lu claire, système de couleurs par
catégorie de notification cohérent avec les tokens sémantiques. Cliquer sur une notification ne
navigue jamais vers l'objet concerné (course, paiement) — opportunité UX manquée.

#### Messagerie *(partagé)* — `src/pages/shared/ChatPage.tsx` — **6.5/10**
Formulaire de saisie bien géré, bons `aria-label`. État vide en texte brut au lieu du composant
`EmptyState` standardisé (incohérence). Aucune liste de conversations — accès uniquement via un
contexte de course actif. Pas de `aria-live` sur les nouveaux messages entrants.

#### Sécurité *(partagé)* — `src/pages/shared/SecurityPage.tsx` — **8/10**
**Le meilleur écran de tout l'audit.** Seule confirmation d'action destructive à deux étapes de
toute l'app, seule vraie validation de formulaire, composant `Switch` custom pleinement
accessible (`role`, `aria-checked`, `focus-visible`). Seul bémol : la mise à jour du mot de passe
reste factice (toast d'indisponibilité).

**Synthèse passager :** design system globalement bien appliqué (tokens cohérents), `EmptyState`
maîtrisé partout où il est utilisé, `MatchingPage`/`TrackingPage` les plus proches du niveau
Uber/Yango visé. Faiblesses systémiques : **aucun `Skeleton` sur les 17 écrans**, **aucun
`ErrorState` utilisé nulle part**, responsive desktop très inégal (les écrans les plus critiques
du parcours de conversion n'ont aucune classe `lg:`), au moins 3 CTA fonctionnellement factices
(Recharger, Contacter le support, Changer le mot de passe) présentés comme pleinement actifs, et
absence de confirmation avant suppression sur 2 écrans alors que le pattern existe et fonctionne
ailleurs (`SecurityPage`).

---

### 3.2 Écrans Chauffeur — moyenne 6.3/10

*(Auditeur : agent dédié, lecture intégrale de 7 fichiers)*

#### Accueil (Dashboard/Disponibilité/Demandes) — `src/pages/driver/DriverHomePage.tsx` — **6/10**
Toggle en ligne/hors ligne exemplaire en accessibilité (`role="switch"`, `aria-checked`,
`aria-label`, focus visible). **Seul écran chauffeur sans titre `<h1>` visible sur mobile**
(rupture avec les 6 autres). Countdown de 15s sur une demande entrante sans repère numérique
clair. Texte "simulation de démonstration" visible directement en interface.

#### Navigation / Course en cours — `src/pages/driver/DriverTrackingPage.tsx` — **6.5/10**
Bon pattern carte plein écran + bottom sheet façon Uber. **Aucune action manuelle du chauffeur**
pour faire progresser la course (arrivée, démarrage, fin — tout est automatique via la
simulation) : le chauffeur est spectateur de sa propre course. Pas de bouton SOS/signaler un
problème. Couleurs de marqueurs hardcodées en hex.

#### Historique — `src/pages/driver/DriverTripsPage.tsx` — **5/10**
**L'écran le plus faible du lot chauffeur.** Liste statique non cliquable : aucun détail de
course, aucun filtre, aucun total agrégé. `EmptyState` bien présent mais c'est le seul point
fort. Le composant `Table` du design system n'est pas utilisé alors qu'il serait pertinent.

#### Revenus / Gains — `src/pages/driver/DriverEarningsPage.tsx` — **7/10**
**L'écran le mieux exécuté du lot chauffeur.** Flux de retrait complet et honnête sur son
caractère simulé, bons états désactivés. Aucun graphique de tendance des gains (uniquement des
totaux statiques). Méthode de retrait hardcodée sur Orange Money sans possibilité de choix
malgré un libellé générique "Mobile Money".

#### Profil chauffeur — `src/pages/driver/DriverProfilePage.tsx` — **7.5/10**
Bonne parité structurelle avec le profil passager. Aucun badge/alerte sur l'item "Documents" pour
signaler un document en attente/rejeté, alors que cette donnée existe déjà dans `account.documents`
— opportunité manquée de remontée d'information critique.

#### Véhicule — `src/pages/driver/VehiclePage.tsx` — **5.5/10**
Formulaire cohérent visuellement. **Régression d'accessibilité concrète** : les boutons de
sélection de type véhicule et le bouton "Retour" (implémentés en `<button>` brut plutôt qu'en
composant `Button` partagé) n'ont **aucun `focus-visible:ring`**, contrairement à tous les CTA
"officiels" de l'app. État `loading` du bouton Enregistrer totalement factice (opération
100% synchrone).

#### Documents / Vérification — `src/pages/driver/DocumentsPage.tsx` — **6.5/10**
**Le meilleur système de statuts multi-états de tout l'audit chauffeur** (`VALIDATED`/`PENDING`/
`REJECTED`/`MISSING` mappés proprement sur des `Badge` sémantiques). Aucune prévisualisation du
document envoyé, aucun motif affiché en cas de rejet — bloquant pour un vrai produit. Même défaut
de `focus-visible` sur le bouton "Retour" que `VehiclePage`.

**Synthèse chauffeur :** les fondations (composants, tokens, layout responsive de base) sont au
même niveau que le passager, mais **l'expérience métier spécifique au chauffeur est nettement en
retrait** : aucun contrôle actif sur la progression d'une course, historique inexploitable, statut
de vérification de compte non remonté au niveau du profil. Le texte "simulation de démonstration"
exposé en dur sur le dashboard, combiné à l'absence totale d'action manuelle sur `DriverTrackingPage`,
donne l'impression d'un pilote automatique plutôt que d'un outil de travail professionnel. Deux
régressions d'accessibilité identiques (boutons "Retour" sans focus visible) sur 2 écrans
distincts suggèrent qu'un composant `BackButton` partagé manque au design system.

---

### 3.3 Écrans Admin — moyenne 6.2/10

*(Auditeur : agent dédié, lecture intégrale de 9 fichiers + `AppShell.tsx`)*

**Cadre transversal (`AppShell`) :** bonne distinction desktop (sidebar 256px + top bar avec
titre dynamique)/mobile (bottom nav `overflow-x-auto`), skip-link, `aria-label` sur les nav — un
bon socle, sous-exploité par les pages qu'il héberge.

#### Dashboard — `src/pages/admin/AdminDashboardPage.tsx` — **6.5/10**
Bonne priorisation (KPIs → graphique → table). Couleurs du graphique Recharts **hardcodées en
hex/HSL brut** (`#0F2A4D`, `#5B6472`, `hsl(214 18% 90%)`) au lieu des tokens CSS — dérive
silencieuse si la palette change. Aucune alerte sur anomalie (taux d'annulation élevé, paiements
échoués), aucune sélection de période.

#### Utilisateurs — `src/pages/admin/AdminUsersPage.tsx` — **6/10**
Table lisible, bon usage des tokens. **Blocage d'un compte utilisateur en un clic, sans aucune
confirmation** — risque d'erreur humaine élevé pour une action à fort impact. Pas de recherche ni
de pagination.

#### Chauffeurs — `src/pages/admin/AdminDriversPage.tsx` — **6/10**
Table la plus riche en information (8 colonnes). Même lacune : suspension en un clic sans
confirmation. Documents non consultables depuis cet écran (juste un compteur "X/4"). Chips de
filtre mélangeant deux dimensions différentes (connexion vs vérification) sans séparation
visuelle.

#### Courses — `src/pages/admin/AdminRidesPage.tsx` — **5.5/10**
**L'écran le plus limité fonctionnellement** de l'espace admin : consultation pure, aucune
action, aucun détail de course cliquable. Filtres de statut incomplets (3 des 8 statuts possibles
seulement). `STATUS_BADGE` dupliqué à l'identique avec `AdminDashboardPage` (dette technique).

#### Paiements — `src/pages/admin/AdminPaymentsPage.tsx` — **6.5/10**
Bonne hiérarchisation avec 3 `StatCard` de synthèse en tête. Grille de StatCard **non
responsive** (`grid-cols-3` fixe même sur mobile), incohérent avec le Dashboard qui, lui,
s'adapte. Aucune action sur une transaction en échec.

#### Support — `src/pages/admin/AdminSupportPage.tsx` — **7/10**
**Meilleur écran admin de l'audit.** Seul écran admin à gérer un état vide explicite (bien que
via un texte brut plutôt que le composant `EmptyState`). Choix de layout en `Card` adapté au
contenu. Impossible de rouvrir un ticket résolu/fermé par erreur ; pas de vue conversationnelle du
ticket.

#### Analytics — `src/pages/admin/AdminAnalyticsPage.tsx` — **6.5/10**
Écran le plus riche visuellement (4 graphiques + classement). Reproduit et **amplifie** le
problème de couleurs Recharts hardcodées du Dashboard (constantes dupliquées entre les deux
fichiers). Aucune sélection de période, aucun export.

#### Journal d'audit — `src/pages/admin/AdminAuditPage.tsx` — **5/10**
**Écran le plus pauvre en interactivité de toute la série admin** : simple table sans aucun
filtre ni pagination, alors que c'est justement l'écran où la capacité de recherche par
auteur/action serait la plus critique pour un usage réel de conformité. Rupture du pattern
"filter chips" présent sur 5 des 6 autres écrans de liste.

#### Paramètres — `src/pages/admin/AdminSettingsPage.tsx` — **6.5/10**
Meilleur exemple d'accessibilité de composant custom de la série admin (`Switch` bien
implémenté). **Les toggles de fonctionnalités plateforme (dont "Mode maintenance") ne sont pas
persistés** — piège UX réel pour un écran de configuration critique, l'admin peut croire avoir
enregistré un changement qui disparaît au rechargement.

**Synthèse admin :** le pattern dominant — "filter chips horizontaux + `Table`" — est **dupliqué
à l'identique dans 5 fichiers séparés** sans composant `FilterChips` factorisé, avec le même
défaut d'accessibilité répété partout (`aria-pressed` absent). Lacune la plus systématique :
**sur 9 écrans, aucun n'utilise `Skeleton` ou `ErrorState`**, un seul gère un état vide. Deux
graphiques dupliquent des constantes de couleur hardcodées. L'absence de confirmation avant
action destructive est répétée sur 3 écrans alors que le composant `Modal` existe déjà.

---

### 3.4 Fondations du Design System & écrans Auth/Onboarding — moyenne 6.4/10 (écrans)

*(Auditeur : agent dédié, lecture intégrale de `globals.css`, `tailwind.config.ts`, 15 composants
`ui/`, `ComingSoon`/`ErrorBoundary`, 8 écrans auth, 6 composants `features/auth/components/`)*

**Palette actuelle (valeurs HSL exactes du code) :**
Primary (bleu nuit) `213°` en 11 nuances 50→950, `DEFAULT` = 800 (`213 58% 17%`). Secondary (vert
profond) `158°` en 11 nuances, `DEFAULT` = 800 (`158 48% 15%`). Sémantiques : `--success`
(`158 45% 27%`, **identique visuellement à secondary-600** — pas de teinte propre), `--warning`
(`38 85% 42%` + `--warning-strong` assombri pour le texte), `--danger` (`356 65% 40%`), `--info`
(`213 55% 32%`, **alias de primary-600/700**). Typographie : Manrope (titres) + Inter (corps),
mais seulement 4 paliers définis (`display/h1/h2/h3`) — pas de `body`/`caption`/`small`, comblé
par des valeurs arbitraires (`text-[15px]`, `text-[17px]`) disséminées dans le code plutôt que
dans des tokens.

#### Composants UI — inventaire
`Button` (6 variantes, bon niveau de polish, seul composant testé), `Input`/`SearchInput` (deux
implémentations séparées du même style de focus, jamais unifiées), `Card`, `Rating`
(`role="radiogroup"` discutable), `Skeleton`/`SkeletonText`/`SkeletonCircle`/`SkeletonCard`
(`role="status"` répété sur chaque instance plutôt que groupé), `EmptyState`/`ErrorState` (bonne
cohérence entre eux), `Modal` (**pas de focus trap** malgré de bons attributs ARIA de façade),
`BottomSheet` (logique dupliquée avec `Modal`, overlay visuellement différent — pas de
`backdrop-blur`), `StatCard`, `Toaster`, `Table` (complet mais sans tri/pagination intégrés),
`Avatar`, `Badge` (seul composant à exposer une variante `success` — qui est en réalité un alias
de `secondary`).

**Composants de formulaire manquants :** pas de `Select` stylisé (le seul `<select>` du code, dans
`StyleGuidePage`, est un `<select>` HTML natif non harmonisé, `rounded-lg` au lieu de `rounded-xl`),
pas de `Checkbox`, `Radio`, `Switch` généralisé (il existe 3 implémentations locales différentes
dans 3 fichiers différents), `Textarea`, `Tabs`, `Tooltip`, `Accordion`, `Dropdown`, `Pagination`.

#### Écrans Auth/Onboarding — détail

| Écran | Note | Point clé |
|---|---|---|
| `OnboardingPage.tsx` | 7/10 | Bien animé, mais interaction tap-only (pas de swipe tactile), accessibilité clavier/progress incomplète |
| `WelcomePage.tsx` | 6.5/10 | Seul écran du parcours pré-auth sur fond sombre (`bg-primary-900`) — rupture de continuité visuelle. Bouton "Créer un compte" redéfinit `outline` par surcharge plutôt qu'une vraie variante |
| `LoginPage.tsx` | 6/10 | Bloc "Accès rapide démo" visible en permanence — artefact de démo à conditionner avant toute mise en avant publique. Pas de show/hide password |
| `RegisterPage.tsx` | 6.5/10 | Bon séquencement 2 étapes. Segmented control véhicule réimplémenté à la main (3ᵉ pattern différent du genre dans le code). Pas de CGU |
| `VerifyEmailPage.tsx` | 6.5/10 | **Nommage trompeur** — vérifie un téléphone, pas un email. Bon composant OTP (gère le paste) |
| `ForgotPasswordPage.tsx` | 6.5/10 | Incohérence avec VerifyEmail : pas de cooldown de renvoi ici. Politique de mot de passe faible (6 caractères min, aucune règle de robustesse) |
| `NotFoundPage.tsx` | 7/10 | Sobre et efficace, seul défaut : titre `<h3>` hérité d'`EmptyState` au lieu d'un vrai `<h1>` |
| `StyleGuidePage.tsx` | 5.5/10 | **Obsolète** — ignore tous les composants `features/auth/components/`, footer affiche encore "Phase 1 validée, en attente de la Phase 2" alors que l'app a 13 phases complètes |

**Incohérences transversales des fondations (les plus significatives) :**
1. **Trois traitements de focus/sélection différents et non unifiés** (`Button` via `--ring`,
   `Input` via `primary-100` codé en dur, `Card selected` via une troisième combinaison).
2. `--success`/`--info` définis en CSS mais quasiment jamais utilisés — le code pioche
   directement dans `secondary-*`/`primary-*`.
3. Border-radius incohérent entre surfaces de même famille (`rounded-2xl` vs `rounded-xl` vs
   `rounded-lg` sur le `<select>` natif vs `rounded-full` sur les chips).
4. `Modal` et `BottomSheet` — même rôle, logique dupliquée, overlay visuellement différent.
5. Quatre implémentations différentes du pattern "choisir une option parmi N", avec des garanties
   d'accessibilité différentes à chaque fois, faute d'un `RadioGroup`/`SegmentedControl` central.
6. `OnboardingIllustrations.tsx` — couleurs en hex brut, complètement déconnectées des tokens.
7. Un seul composant sur 15 a un test (`Button.test.tsx`).

---

## 4. Problèmes UX transversaux

Consolidation des constats répétés à travers les 4 audits (passager, chauffeur, admin,
auth/design system) :

1. **Absence quasi totale de gestion d'état de chargement/erreur.** Sur ~41 écrans, aucun
   n'utilise `Skeleton`, aucun n'utilise `ErrorState`. Explicable aujourd'hui (aucun vrai appel
   réseau dans l'app), mais c'est une dette qui deviendra critique dès qu'un backend réel sera
   branché — rien dans l'UI n'anticipe la latence ni l'échec réseau.
2. **CTA fonctionnellement factices présentés comme pleinement actifs**, répétés au moins 5 fois
   (Recharger le portefeuille, Contacter le support, Changer le mot de passe côté passager ;
   simulation "pilote automatique" de la course côté chauffeur ; toggles de configuration
   plateforme non persistés côté admin) — érode la confiance perçue si non retravaillé avant
   présentation.
3. **Absence de confirmation avant action destructive**, incohérente au sein même de l'app :
   `SecurityPage` (suppression de compte) fait très bien une confirmation en deux étapes, mais
   `PaymentMethodsPage`, `SavedPlacesPage`, `AdminUsersPage` (blocage), `AdminDriversPage`
   (suspension) exécutent l'action destructive en un seul clic.
4. **Responsive desktop très inégal**, en particulier sur les écrans les plus critiques du
   parcours de conversion passager (`BookingPage`, `MatchingPage`, `TrackingPage`,
   `SearchDestinationPage`) qui n'ont **aucune** classe responsive et restent strictement mobile.
5. **Aucun contrôle actif du chauffeur sur sa propre course** — toute la progression est
   automatique (simulation), aucune action "Je suis arrivé"/"Démarrer"/"Terminer".
6. **Écrans de consultation pure sans aucune action exploitable** là où un vrai produit
   permettrait d'agir : `RideDetailPage` (pas de réclamation/reçu téléchargeable),
   `DriverTripsPage` (liste non cliquable), `AdminRidesPage` (aucune action sur une course),
   `AdminAuditPage` (aucun filtre alors que c'est l'écran qui en aurait le plus besoin).
7. **Textes de développement/roadmap exposés directement en interface** ("carte réelle en
   Phase 6", "Position actuelle (simulée)", "simulation de démonstration", "Phase 9" pour le
   support) — à retirer avant toute présentation externe.
8. **Écran blanc silencieux (`return null`)** en cas de données manquantes sur au moins 10
   écrans à travers l'app, sans aucun état transitoire visuel.
9. **Accessibilité des mises à jour dynamiques quasi absente** : aucun `aria-live` nulle part
   dans l'app (changement de statut de course, arrivée d'un message, transition de matching),
   alors que le suivi temps réel est au cœur de la valeur produit.

---

## 5. Problèmes UI transversaux

1. **Couleurs hardcodées en dehors du système de tokens**, à trois niveaux distincts : les
   graphiques Recharts admin (`#0F2A4D`, `#5B6472`, `hsl(214 18% 90%)` dupliqués dans 2 fichiers),
   les marqueurs de carte passager/chauffeur (`#1B6854`, `#0F2A4D`), et les illustrations SVG
   d'onboarding (10 couleurs hex indépendantes de la palette).
2. **Duplication de composants/patterns non factorisés** : le bloc "filter chips" est copié à
   l'identique dans 5 pages admin ; la logique Escape/scroll-lock est dupliquée entre `Modal` et
   `BottomSheet` ; le pattern "segmented control" est réimplémenté 3 fois différemment
   (RegisterPage véhicule, RoleSelectCard, VehicleColorPicker) avec des niveaux d'accessibilité
   different à chaque fois.
3. **Incohérence de border-radius** entre familles de composants censées appartenir à la même
   catégorie visuelle (surfaces flottantes, champs de formulaire, pastilles).
4. **`focus-visible` non standardisé** — 3 traitements différents selon le composant, et deux
   régressions concrètes où le focus visible disparaît complètement (boutons custom dans
   `VehiclePage`/`DocumentsPage`).
5. **Titre de page manquant en desktop** sur au moins 6 écrans (`<h1 className="lg:hidden">` sans
   équivalent desktop), laissant l'en-tête de section vide sur grand écran.
6. **`StyleGuidePage` obsolète** — ne référence pas les composants d'auth/onboarding ajoutés
   après coup, n'est plus une source de vérité fiable du design system actuel.
7. **Grilles de statistiques non adaptatives** par endroits (`AdminPaymentsPage` fixé à 3
   colonnes) alors que le même composant `StatCard` s'adapte correctement ailleurs
   (`AdminDashboardPage`).

---

## 6. Design System recommandé

Palette fournie, à adopter comme nouvelle base de tokens (remplace la palette bleu-nuit/vert HSL
actuelle — voir mapping de transition en fin de section) :

### 6.1 Palette

| Rôle | Token | Valeur |
|---|---|---|
| Primary | `--primary` | `#102A43` |
| Primary Dark | `--primary-dark` | `#071A2B` |
| Accent Green | `--accent` | `#16A875` |
| Accent Green Dark | `--accent-dark` | `#087A55` |
| Background | `--background` | `#F7F9FC` |
| Surface | `--surface` | `#FFFFFF` |
| Text Primary | `--text-primary` | `#101828` |
| Text Secondary | `--text-secondary` | `#667085` |
| Border | `--border` | `#E4E7EC` |
| Success | `--success` | `#12B76A` |
| Warning | `--warning` | `#F79009` |
| Danger | `--danger` | `#D92D20` |

**Différences structurelles à anticiper par rapport aux tokens actuels :**
- Le système actuel utilise des échelles complètes 50→950 pour primary/secondary (11 nuances
  chacune) ; la palette fournie ne donne que 2 points par couleur de marque (base + dark). **Il
  faudra générer une échelle intermédiaire complète** (50/100/200/300/400/500/600/700/800/900)
  par interpolation depuis `#102A43`→`#071A2B` pour primary et une échelle équivalente pour
  l'accent vert, afin de couvrir les mêmes besoins (fonds `-50`, bordures `-200`, texte `-700`,
  etc.) déjà utilisés dans ~40 écrans.
- `--success`/`--warning`/`--danger` deviennent enfin des couleurs **véritablement indépendantes**
  de la marque (contrairement à l'existant où `success` était un alias visuel de `secondary`) —
  l'audit a montré que le code actuel n'exploitait jamais `--success` comme couleur propre ; ce
  sera corrigé de fait par la nouvelle palette, à condition que les composants soient mis à jour
  pour réellement consommer ce token plutôt que de repiquer dans l'échelle "accent".
- `Text Primary` (`#101828`) et `Text Secondary` (`#667085`) remplacent `--foreground`/
  `--muted-foreground` — mapping direct, pas de perte de fonctionnalité.
- `Background` (`#F7F9FC`, un gris-bleu très clair) diffère du blanc pur actuel — **tout écran qui
  suppose actuellement un fond blanc pur derrière une `Card` blanche (`Surface` = `#FFFFFF`)
  gagnera en contraste de séparation entre fond de page et cartes**, un vrai gain visuel côté
  hiérarchie (aujourd'hui `--background` et `--surface` sont presque identiques : `0 0% 100%` vs
  `210 20% 98%`).

### 6.2 Typographie — Inter (police unique)

Proposition : abandonner la double police Manrope/Inter actuelle au profit d'**Inter seule**,
pour supprimer le double mécanisme CSS natif + classes Tailwind identifié comme source de
confusion (section 3.4, point 6). Échelle complète (comble le vide actuel — l'app n'avait que 4
paliers) :

| Nom | Taille | Poids | Line-height | Usage |
|---|---|---|---|---|
| Display | 48px / 3rem | 800 | 1.1 | Hero, écrans d'onboarding |
| H1 | 32px / 2rem | 700 | 1.2 | Titre de page |
| H2 | 24px / 1.5rem | 700 | 1.25 | Titre de section |
| H3 | 20px / 1.25rem | 600 | 1.3 | Sous-titre de section, titre de carte |
| Body Large | 17px / 1.0625rem | 500 | 1.5 | Texte d'accroche, CTA importants |
| Body | 15px / 0.9375rem | 400 | 1.5 | Texte courant |
| Body Small | 13px / 0.8125rem | 400 | 1.4 | Texte secondaire, métadonnées |
| Caption | 12px / 0.75rem | 500 | 1.3 | Labels, badges, légendes |
| Button | 15px / 0.9375rem | 600 | 1 | Texte de bouton |

Cette échelle absorbe directement les valeurs arbitraires disséminées dans le code actuel
(`text-[15px]`, `text-[17px]`, `text-[11px]`) en leur donnant enfin un nom et une place dans le
système plutôt que d'être réinventées à chaque écran.

### 6.3 Border-radius, shadows

Proposition de règle **explicite et documentée** (contrairement à l'existant, jamais formalisé) :
- `radius-sm` (8px) : badges, chips, petits éléments inline.
- `radius-md` (12px) : champs de formulaire, boutons.
- `radius-lg` (16px) : cartes.
- `radius-xl` (24px) : modales, bottom sheets, surfaces flottantes majeures.
- `radius-full` : avatars, pastilles de statut, pills de filtre.

Shadows : conserver la logique à 3 niveaux actuelle (`card`/`elevated`/`sheet`) mais ajouter un
4ᵉ niveau `modal` distinct de `elevated` (actuellement `Modal` réutilise `shadow-elevated`, identique
à une simple carte survolée — pas assez de séparation visuelle pour un élément qui doit dominer
l'écran).

---

## 7. Composants à créer

Composants absents du design system actuel, nécessaires pour couvrir les besoins déjà identifiés
dans le code existant (pas des besoins hypothétiques — chacun correspond à un pattern déjà
réimplémenté ad hoc au moins une fois) :

| Composant | Justifié par |
|---|---|
| `IconButton` | Boutons icône seule répétés sans composant dédié (retour, notifications, appel) |
| `SegmentedControl` / `RadioGroup` | 4 réimplémentations différentes du même besoin (RegisterPage véhicule, RoleSelectCard, VehicleColorPicker, filtres admin) |
| `Select` | Aucun composant stylisé — un `<select>` natif isolé dans StyleGuidePage |
| `Checkbox`, `Switch` (généralisé) | 3 implémentations locales du Switch (AdminSettingsPage, SecurityPage, DriverHomePage) à fusionner en un seul composant `ui/` |
| `Textarea` | Champ commentaire de `RideCompletedPage` utilise un `Input` une ligne |
| `Tabs` | Aucun équivalent — les écrans à filtres (admin) simulent un tab-like avec des chips |
| `FilterChips` | Dupliqué à l'identique dans 5 pages admin |
| `Tooltip` | Aucun tooltip nulle part (ex. bouton désactivé sans explication sur WalletPage) |
| `Pagination` | Absente de tous les écrans de liste, y compris `Table` |
| `BackButton` | Réimplémenté en `<button>` brut sans focus visible dans plusieurs écrans |
| `Logo` | Le "C+" est recodé en dur dans au moins 3 fichiers (WelcomePage, AuthLayout, StyleGuidePage) |
| `ConfirmDialog` | Généraliser le pattern de confirmation à deux étapes de `SecurityPage` à toute action destructive |
| `DriverCard` | Carte chauffeur (matching, dashboard chauffeur) recomposée à la main à chaque écran |
| `VehicleCard` | Idem pour l'affichage véhicule (BookingPage, VehiclePage) |
| `RideCard` | Carte de course réutilisée en variantes légèrement différentes (TripsPage, DriverTripsPage, RideDetailPage) |
| `PriceCard` / `PriceBreakdown` | Récapitulatif tarifaire recomposé à la main sur BookingPage/RideCompletedPage/RideDetailPage |
| `PaymentMethodRow` | Ligne de moyen de paiement dupliquée entre BookingPage et PaymentMethodsPage |
| `StatusBadge` (course/paiement/ticket/document) | `STATUS_BADGE` redéfini indépendamment dans au moins 6 fichiers différents avec les mêmes couleurs |
| `SafetyPanel` | N'existe pas — aucun composant de sécurité pendant la course (SOS, partage de trajet) alors que c'est demandé dans l'objectif de refonte |
| `MapMarker` (abstraction) | Couleurs hardcodées directement dans les appels à MapView plutôt qu'un composant dédié |
| `RideSummary` | Récapitulatif trajet (pickup→destination) recomposé à la main sur au moins 5 écrans |
| `EmptyState` avec CTA intégré | Généraliser le pattern déjà exemplaire de `SavedPlacesPage` à tous les écrans de liste |

---

## 8. Composants à refactoriser

| Composant | Refactoring nécessaire |
|---|---|
| `Modal` | Ajouter un vrai focus trap + restitution du focus à la fermeture |
| `BottomSheet` | Factoriser la logique Escape/scroll-lock partagée avec `Modal` dans un hook commun ; aligner l'overlay (`backdrop-blur`) |
| `Input` / `SearchInput` | Unifier en un seul composant avec variantes, au lieu de deux implémentations séparées du même style de focus |
| `Badge` | Faire réellement consommer les tokens `--success`/`--warning`/`--danger` de la nouvelle palette au lieu d'aliaser `secondary` |
| `Skeleton` | Regrouper le `role="status"` sur un conteneur englobant plutôt que sur chaque instance |
| `Table` | Ajouter tri de colonne, recherche intégrée, pagination |
| `StyleGuidePage` | Reconstruction complète — doit référencer aussi les composants `features/auth/components/`, mettre à jour le texte de statut de phase |
| `RoleSelectCard` | Ajouter `aria-pressed` (déjà présent sur `VehicleColorPicker`, à harmoniser) |
| `OnboardingIllustrations` | Reconnecter les couleurs aux tokens CSS au lieu de hex bruts |
| Boutons custom (`VehiclePage`, `DocumentsPage`) | Remplacer par le composant `Button`/nouveau `BackButton` pour récupérer le focus visible standardisé |
| Graphiques Recharts (Dashboard, Analytics) | Centraliser les couleurs/constantes de style dans un fichier de config partagé au lieu de dupliquer les valeurs hex dans 2 fichiers |
| Toggles de configuration admin | Persister réellement l'état (store) au lieu d'un `useState` local qui se réinitialise silencieusement |

---

## 9. Parcours utilisateur cible

Parcours passager de bout en bout, tel que demandé, mappé sur les écrans réels existants (et les
manques à combler) :

```
Home (PassengerHomePage)
  → Destination (SearchDestinationPage)
  → Map (n'existe pas en écran autonome — à intégrer visuellement dans Destination/Booking)
  → Service + Price (fusionnés dans BookingPage — à conserver fusionné, cohérent avec Uber/Yango)
  → Payment (fusionné dans BookingPage — ok)
  → Confirmation (n'existe pas séparément — à considérer comme united avec le CTA de BookingPage)
  → Matching (MatchingPage, phase recherche)
  → Driver Found (MatchingPage, phase résultat — même fichier, ok)
  → Tracking (TrackingPage)
  → Ride (TrackingPage, statut IN_PROGRESS)
  → Arrival (TrackingPage, statut DRIVER_ARRIVED — à mieux différencier visuellement, cf. 3.1)
  → Rating (RideCompletedPage)
  → Receipt (RideDetailPage, accessible depuis l'historique)
```

Le parcours existant colle déjà globalement à la cible demandée — la fusion Service+Price+Payment
en un seul écran (`BookingPage`) et Matching+DriverFound en un seul écran est un choix cohérent
avec Uber/Yango, à conserver plutôt qu'à démultiplier. Les vrais manques à combler pour atteindre
le niveau cible :
- Un vrai composant carte interactif intégré dès l'étape Destination (aujourd'hui : liste texte
  pure, aucune carte).
- Une différenciation visuelle claire par statut sur `TrackingPage` (aujourd'hui : une seule
  couleur de pastille pour tous les statuts).
- Un accès au reçu directement depuis l'écran de fin de course (`RideCompletedPage`), pas
  seulement via l'historique.
- Un `SafetyPanel` accessible pendant `Tracking`/`Ride` (bouton SOS, partage du trajet) —
  totalement absent aujourd'hui alors que la sécurité est un des 14 axes explicitement demandés
  pour la refonte.

---

## 10. Roadmap de refonte

Proposition de séquencement (à valider avec vous avant tout démarrage — conformément à la règle
absolue de ce projet : chaque phase attend une validation explicite avant de commencer la
suivante) :

1. **Fondations** — nouvelle palette + échelle complète, typographie Inter unique, tokens radius/
   shadow documentés, dans `globals.css`/`tailwind.config.ts`. Rien d'autre ne doit changer tant
   que cette base n'est pas posée.
2. **Composants système** — création des composants manquants (section 7) et refactoring des
   composants existants (section 8), validés isolément via `StyleGuidePage` reconstruite avant
   d'être propagés aux écrans.
3. **Écrans passager** — dans l'ordre du parcours cible (section 9), en commençant par les écrans
   de conversion actuellement sans responsive (`SearchDestinationPage` → `BookingPage` →
   `MatchingPage` → `TrackingPage`), puis le reste (Wallet, Profil, Historique, écrans partagés).
4. **Écrans chauffeur** — en priorisant le comblement du vrai manque fonctionnel identifié
   (contrôle actif de la course, historique exploitable, alerte de statut de compte), pas
   seulement un re-style visuel.
5. **Écrans admin** — en priorisant la factorisation des composants dupliqués (`FilterChips`,
   `StatusBadge`) qui, une fois faite, corrige automatiquement plusieurs écrans à la fois.
6. **États transverses** — intégration systématique de `Skeleton`/`ErrorState`/`EmptyState` sur
   tous les écrans, en anticipation d'un futur backend réel.
7. **Accessibilité** — passe finale dédiée (`aria-live` sur les transitions temps réel, focus trap
   des modales, `aria-pressed` généralisé) une fois les écrans stabilisés visuellement.
8. **Nettoyage** — retrait de tous les textes de développement/roadmap exposés en interface
   (section 4, point 7), retrait ou conditionnement du bloc "Accès rapide démo".

---

**Fin de l'audit. Aucune modification de code de production n'a été effectuée pour produire ce
document — voir résumé de synthèse dans la réponse accompagnant ce rapport.**
