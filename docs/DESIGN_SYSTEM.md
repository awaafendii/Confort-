# Confort+ — Design System v2

**Statut : Phase 1 (Design Tokens) ✅ validée · Phase 2 (Composants) ✅ validée · Phase 3 (Style
Guide) livrée, en attente de validation.**
Ce document est la
source de vérité vivante du design system. `StyleGuidePage.tsx` (`/design-system`), identifiée
dans `docs/UIUX_AUDIT.md` comme obsolète, a été reconstruite en Phase 3 pour redevenir une
référence visuelle fidèle de ce document — les deux sont désormais tenus à jour ensemble à chaque
phase de la refonte (`docs/UIUX_AUDIT.md` § 35).

Toutes les valeurs ci-dessous sont **déjà appliquées** dans `src/styles/globals.css` et
`tailwind.config.ts` (Phase 1). **Aucun écran ni composant métier n'a été modifié** — seuls les
tokens ont changé, ce qui fait déjà évoluer visuellement toute l'app (couleurs, typographie,
radius) sans toucher une seule ligne de JSX.

---

## 1. Palette

Valeurs HSL converties avec précision depuis les hex fournis (formules standard sRGB→HSL) :

| Rôle | Hex | HSL | Token CSS | Emplacement dans l'échelle |
|---|---|---|---|---|
| Primary | `#102A43` | `209 61% 16%` | `--primary-800` | Ancre exacte |
| Primary Dark | `#071A2B` | `208 72% 10%` | `--primary-900` | Ancre exacte |
| Accent | `#16A875` | `159 77% 37%` | `--accent-600` | Ancre exacte |
| Accent Dark | `#087A55` | `161 88% 25%` | `--accent-800` | Ancre exacte |
| Background | `#F7F9FC` | `216 45% 98%` | `--background` | — |
| Surface | `#FFFFFF` | `0 0% 100%` | `--surface` | — |
| Text Primary | `#101828` | `220 43% 11%` | `--foreground` | — |
| Text Secondary | `#667085` | `221 13% 46%` | `--muted-foreground` | — |
| Border | `#E4E7EC` | `218 17% 91%` | `--border`, `--input` | — |
| Success | `#12B76A` | `152 82% 39%` | `--success` | — |
| Warning | `#F79009` | `34 94% 50%` | `--warning` | — |
| Danger | `#D92D20` | `4 74% 49%` | `--danger` | — |

Échelles complètes 50→950 générées pour `primary` et `accent` (11 nuances chacune), ancrées
exactement sur les deux points fournis par couleur (base + dark) — voir `globals.css` pour le
détail des 22 valeurs. Nécessaire car la charte ne fournit que 2 points par couleur alors que
~40 écrans consomment déjà une échelle complète (fonds `-50`, bordures `-200`, texte `-700`, etc.).

**Décision — pourquoi `accent-600`/`accent-800` et pas `accent-800`/`accent-900` comme pour
primary :** le vert de marque (`#16A875`, L=37%) reste lisible/vibrant à une luminosité plus
élevée que le bleu nuit ; le forcer dans un slot "800" (typiquement très sombre) aurait cassé le
sens décroissant de l'échelle. `accent.DEFAULT = accent-600` (le vert fourni tel quel, pas sa
variante sombre) — c'est la couleur destinée aux CTA/éléments visibles au quotidien.

**`--success`/`--info` — correction d'un défaut identifié dans l'audit :** l'ancien système
définissait ces tokens en CSS mais aucun composant ne les consommait réellement (ils piochaient
directement dans `secondary`/`primary`). Ils ont maintenant leurs propres valeurs exactes issues
de la charte. La reconnexion effective des composants (`Badge`, `StatCard`, `Avatar`) à ces tokens
est prévue en **Phase 2** (composants), pas dans cette phase.

---

## 2. Compatibilité — `secondary` reste un alias de `accent`

**Décision clé de cette phase**, à valider explicitement avec vous : `--secondary-*` (CSS) et
`secondary` (Tailwind) sont conservés, mais pointent désormais vers les **mêmes valeurs** que
`--accent-*`/`accent`. Concrètement :
- Toute classe existante `bg-secondary-700`, `text-secondary-800`, etc. (utilisée dans ~35 des 41
  écrans d'après l'audit) s'affiche **immédiatement en vert émeraude** sans qu'un seul fichier de
  page n'ait été touché.
- `accent` est le nom **canonique à utiliser pour tout nouveau code** à partir de la Phase 2.
- Cette dualité est une **dette technique temporaire assumée**, pas un oubli — elle sera résorbée
  quand chaque écran sera revisité dans les phases 4 à 7 (remplacement progressif de `secondary-*`
  par `accent-*` dans les classNames, sans changement de valeur puisque déjà identiques).

## 3. Typographie — Inter unique

Manrope est retiré (import Google Fonts + règle CSS `h1..h6`). Toute l'app rend désormais en
**Inter** partout, y compris les titres qui utilisaient `font-display`/Manrope — la classe
`font-display` est conservée pour la compatibilité des ~15 fichiers qui l'utilisent déjà, mais
pointe maintenant vers Inter.

| Token Tailwind | Taille | Poids | Line-height | Usage |
|---|---|---|---|---|
| `text-display` | 48px | 800 | 1.1 | Hero, onboarding |
| `text-h1` | 32px | 700 | 1.2 | Titre de page |
| `text-h2` | 24px | 700 | 1.25 | Titre de section |
| `text-h3` | 20px | 600 | 1.3 | Sous-titre, titre de carte |
| `text-body-lg` | 17px | 500 | 1.5 | Accroche, CTA importants |
| `text-body` | 15px | 400 | 1.5 | Texte courant |
| `text-body-sm` | 13px | 400 | 1.4 | Texte secondaire, métadonnées |
| `text-caption` | 12px | 500 | 1.3 | Labels, badges, légendes |
| `text-button` | 15px | 600 | 1 | Texte de bouton |

**Effet immédiat à anticiper :** `text-display`/`text-h1`/`text-h2`/`text-h3` changent de taille
(56→48px, 44→32px, 32→24px, 24→20px) partout où ils sont déjà utilisés — c'est le nouveau barème
demandé, pas une régression. Les 5 nouveaux tokens (`body-lg`/`body`/`body-sm`/`caption`/`button`)
n'affectent aucun écran existant tant qu'ils ne sont pas explicitement adoptés (Phase 2+) ; ils
remplacent à terme les valeurs arbitraires disséminées dans le code (`text-[15px]`, `text-[17px]`,
`text-[11px]` relevées dans l'audit).

## 4. Border-radius

| Token | Valeur | Cible d'usage (brief) |
|---|---|---|
| `rounded-sm` | 8px | petits éléments inline |
| `rounded-md` | 12px | **boutons, champs de saisie** |
| `rounded-lg` | 16px | **cartes** |
| `rounded-xl` | 24px | **bottom sheets, modales** |
| `rounded-full` | 9999px | **avatars, badges** |

**Dette technique à résoudre en Phase 2 :** l'ancienne échelle utilisait `rounded-2xl` (26px) pour
Card/Modal/BottomSheet à la fois — un seul className pour deux cibles désormais différentes (Card
doit passer à 16px/`lg`, Modal/BottomSheet restent à 24px/`xl`). Le token `2xl` est temporairement
aliasé sur `xl` (24px) pour ne rien casser visuellement maintenant ; en Phase 2, `Card.tsx` devra
migrer son className de `rounded-2xl` vers `rounded-lg` pour atteindre sa cible réelle de 16px.
`Modal.tsx`/`BottomSheet.tsx` n'auront rien à changer (déjà à la bonne valeur via l'alias).
Boutons/champs (`rounded-xl` actuellement) devront migrer vers `rounded-md` pour atteindre 12px
(actuellement à 24px via l'alias temporaire — écart volontairement toléré une phase, car changer
la classe elle-même est un travail de composant, pas de token).

## 5. Shadows

Quatre niveaux (le 4ᵉ est nouveau) :

| Token | Usage |
|---|---|
| `shadow-card` | cartes au repos (inchangé) |
| `shadow-elevated` | cartes survolées/actives (inchangé) |
| `shadow-sheet` | bottom sheets (inchangé) |
| `shadow-modal` | **nouveau** — modales, plus marqué que `elevated` pour une vraie séparation visuelle |

Les 3 niveaux existants n'ont pas été retouchés (déjà conformes à l'esthétique "premium, discrète"
demandée). `Modal.tsx` devra migrer de `shadow-elevated` vers `shadow-modal` en Phase 2.

## 6. Spacing

**Aucun changement de configuration.** L'échelle Tailwind par défaut contient déjà exactement les
valeurs demandées (4/8/12/16/20/24/32/40/48/64px = clés `1/2/3/4/5/6/8/10/12/16`). Restreindre la
config à ces seules valeurs casserait des usages existants légitimes (`gap-3.5`, `px-2.5`, etc.
relevés dans l'audit). **Recommandation de discipline** pour les nouveaux écrans (Phase 2+) :
préférer systématiquement 4/8/12/16/20/24/32/40/48/64 et n'utiliser une valeur intermédiaire que
si un besoin visuel précis le justifie.

## 7. Breakpoints

Documentés explicitement (`screens` dans `tailwind.config.ts`), valeurs identiques aux défauts
Tailwind — aucun changement de comportement, seulement une décision rendue visible et non
modifiable par accident :

| Token | Largeur | Catégorie |
|---|---|---|
| `sm` | 640px | mobile large |
| `md` | 768px | tablette |
| `lg` | 1024px | desktop |
| `xl` | 1280px | large desktop |
| `2xl` | 1536px | — |

---

## 9. Composants (Phase 2)

Aucune page n'a été modifiée pour livrer cette phase — uniquement `src/components/ui/*` et le
nouveau dossier `src/components/business/*`. Les pages adopteront ces composants au fil des
phases 4 à 7.

### Refactorisés (13)

| Composant | Changement |
|---|---|
| `Button` | radius → `md` (12px), tailles/texte → tokens `text-button`/`text-body-sm`/`text-body-lg`, nouvelle variante `accent` |
| `IconButton` | *(nouveau, groupé ici car extrait du pattern Button)* |
| `Input` | radius → `md`, focus unifié sur `ring-ring` (au lieu de `primary-100` codé en dur) |
| `SearchInput` | idem Input, + focus-visible ajouté sur le bouton d'effacement |
| `Card` | radius → `lg` (16px), fond `bg-surface` (blanc, au lieu de `bg-background` — bug réel révélé par la Phase 1, une Card était invisible sur le nouveau fond gris-bleu), **`interactive` est enfin clavier-opérable** (`role="button"`, `tabIndex`, Enter/Espace) — ne l'était pas avant |
| `Badge` | variante `success` consomme enfin le token `--success` (au lieu d'aliaser `secondary`), nouvelle variante `accent` |
| `Skeleton` | `role="status"` déplacé vers un nouveau `SkeletonGroup` (un seul groupe = une seule annonce, au lieu d'une par fragment) |
| `Modal` | **vrai focus trap** (Tab/Shift+Tab bouclent dans la boîte, focus initial sur le premier élément, restitution au déclencheur à la fermeture — vérifié en direct dans Chrome), radius → `xl` (24px), `shadow-modal`, bouton fermer remplacé par `IconButton` |
| `BottomSheet` | `backdrop-blur` aligné sur Modal, **drag-to-dismiss** (glisser vers le bas ferme la feuille), radius → `xl` |
| `EmptyState` / `ErrorState` | radius de l'icône → `lg` |
| `Toaster` | fond `bg-surface`, radius → `md` |
| `Rating` | `role="radio"`/`aria-checked` par étoile en mode interactif (au lieu d'un `radiogroup` sans enfants `radio`), focus-visible ajouté |

### Nouveaux — primitives (15)

`Textarea`, `Select`, `Checkbox`, `Radio` + `RadioGroup` (navigation clavier flèches incluse),
`Switch` (généralise les 3 implémentations locales dupliquées), `SegmentedControl`, `Tabs`,
`StatusBadge` (rendu générique statut→Badge, la config de labels reste côté page),
`ConfirmDialog` (généralise le seul pattern de confirmation à deux étapes trouvé dans l'audit),
`Tooltip`, `Pagination`, `FilterChips` (extrait le bloc dupliqué dans 5 pages admin),
`BackButton` (corrige l'absence de focus-visible trouvée sur 2 écrans), `Logo` (remplace le "C+"
codé en dur dans 3 fichiers).

### Nouveaux — composants métier (9, dans `src/components/business/`)

`RideCard`, `RideOptionCard`, `DriverCard`, `VehicleCard`, `RideSummary`, `PriceBreakdown`,
`PaymentMethodRow`, `SafetyPanel` (n'existait pas — SOS, partage de trajet, appel, support,
signalement), `MapMarker` (centralise les couleurs de repère cartographique, jusqu'ici codées en
hex directement dans les pages).

## 10. Ce qui n'a PAS changé (garde-fous respectés)

**Phase 1 :**
- Aucune page (`src/pages/**`) ni composant modifié.
- Aucune route, aucun store Zustand, aucun type TypeScript touché.
- React, Tailwind, Zustand, Framer Motion, MapLibre, Recharts : stack intacte.
- Les 3 niveaux d'ombre existants, l'échelle d'espacement, les breakpoints (valeurs) : inchangés.
- `--info` conservé (alias non exploité, comme avant) pour éviter de casser une référence
  résiduelle, à retirer si confirmé inutile.

**Phase 2 :**
- Toujours aucune page (`src/pages/**`) modifiée — uniquement `src/components/**`.
- Aucune route, aucun store Zustand, aucun type TypeScript touché.
- Tous les composants refactorisés restent rétrocompatibles avec leur API existante (mêmes props,
  mêmes noms d'export) — seul leur rendu visuel/comportemental interne a changé.

**Phase 3 :**
- Seul `src/pages/StyleGuidePage.tsx` a été modifié — aucune autre page (`src/pages/**`), aucun
  composant, route, store Zustand ou type TypeScript touché.
- `/design-system` n'est pas un écran métier (outil de développement hors flux
  passager/chauffeur/admin) : la reconstruire ne contrevient pas à la règle « pas d'écran métier
  avant Phase 4 » du brief.

## 12. Style Guide (Phase 3)

`src/pages/StyleGuidePage.tsx` (route `/design-system`) a été entièrement reconstruite. L'ancienne
version montrait des tokens obsolètes (échelle Manrope, `rounded-2xl`, badge « Phase 1 validée, en
attente de la Phase 2 » figé dans le footer) et recomposait certains rendus à la main plutôt que
d'importer les composants réels. La nouvelle version :

- Importe et instancie **chaque composant réel** listé en § 9 (primitives + composants métier)
  depuis `@/components/ui` et `@/components/business` — aucun fragment de style n'est reproduit à
  la main ; ce qui est montré est ce qui existe réellement dans le code.
- Documente visuellement les tokens Phase 1 (palette 50→950, 9 tokens typographiques, échelle de
  spacing, 5 radius, 4 ombres) avec leurs specs (hex/HSL, px/poids/line-height) affichées en regard.
  Sert de vérification croisée avec les tableaux § 1-7 de ce document.
- Utilise des **données mock construites contre les vrais types TypeScript** (`Ride`, `Driver`,
  `Vehicle`, `SavedPaymentMethod`) pour les composants métier — pas de props inventées qui
  diffèrent du contrat réel utilisé par les pages.
- Ajoute un sommaire de navigation (`nav[aria-label="Sommaire"]`, ancres `#id`) pour parcourir les
  14 sections sans dépendre d'un long défilement — cohérent avec l'usage "outil de référence" de
  cette page, pas un écran produit.
- Le focus trap de `Modal` et le déclenchement de `toast` ont été revérifiés en direct dans Chrome
  sur cette nouvelle instance (même méthode qu'en Phase 2) : focus initial dans la boîte, retour
  correct à `document.activeElement` après fermeture.
