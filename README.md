# Portfolio — Carte interactive

Un portfolio de développeur web présenté comme une **carte de monde de jeu de
plateforme** : des mondes thématiques (Présentation, Parcours, Projets,
Compétences, Contact) reliés par un chemin, des points cliquables, une caméra
qui voyage en douceur d'un monde à l'autre — le tout dans une direction
artistique épurée et premium.

## Stack

| Outil | Rôle | Pourquoi |
|---|---|---|
| **React 19 + Vite + TypeScript** | Base de l'app | Rapide, typé, standard |
| **Tailwind CSS v4** | Styles | Tokens centralisés dans `src/index.css`, zéro CSS mort |
| **Framer Motion** | Animations | Springs physiques pour la caméra, `AnimatePresence` pour les panneaux, `pathLength` pour le tracé SVG, `useReducedMotion` intégré |

Le chemin est un simple SVG animé (pas de canvas) : léger, net à toutes les
échelles, et GPU-friendly (uniquement des `transform` / `opacity`).

## Installation & lancement

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # vérification TypeScript + build de production
npm run preview    # prévisualiser le build
```

## ✏️ Modifier le contenu — un seul fichier

**Tout le contenu vit dans [`src/data/content.ts`](src/data/content.ts).**
Vous n'avez jamais besoin de toucher aux composants.

| Quoi | Où dans `content.ts` |
|---|---|
| Nom, rôle, accroche, niveau | objet `profile` |
| Mondes (titres, couleurs, taglines) | tableau `worlds` |
| Points d'un monde (étapes, projets…) | `worlds[i].nodes` |
| Compétences et niveaux (écran RPG) | tableau `skillCategories` |

### Ajouter un point à un monde

Ajoutez un objet dans le tableau `nodes` du monde concerné :

```ts
{
  id: 'mon-projet',                  // unique
  title: 'Mon projet',
  subtitle: 'SaaS · 2026',           // optionnel
  description: 'Texte du panneau de détail.',
  tags: ['React', 'TypeScript'],     // optionnel
  links: [{ label: 'Démo', url: 'https://…' }], // optionnel
  image: {                           // optionnel — illustration du panneau
    src: '/projects/mon-projet.svg', // fichier placé dans public/
    alt: 'Aperçu de mon projet',
  },
}
```

### Image d'illustration (projets)

Placez votre visuel dans `public/` (idéalement 16:9, ≥ 800px de large — PNG,
JPG, WebP ou SVG) et référencez-le via le champ `image` du point. Des
placeholders SVG sont fournis dans `public/projects/` : remplacez-les par de
vraies captures d'écran.

La carte, le chemin, la navigation clavier et la barre de progression se
recalculent automatiquement.

### Ajouter un monde

Ajoutez un objet dans le tableau `worlds` — un **gabarit commenté** est
disponible à la fin du tableau dans `content.ts`. Choisissez un `accent`
désaturé pour rester cohérent avec la DA.

### Cas particulier : l'écran Compétences

Le point avec `kind: 'skills'` ouvre la **fiche de personnage RPG** au lieu du
panneau classique. Les jauges s'animent à l'entrée mais les valeurs sont
**volontairement figées** (pas de bouton « upgrade ») : modifiez-les dans
`skillCategories`.

## 🗺️ Régler la carte

La géométrie (espacement des points, ondulation du chemin, marges) se règle
dans les constantes `MAP` de [`src/map/mapConfig.ts`](src/map/mapConfig.ts).
Un point peut être décalé individuellement via sa propriété `offset`.

## Structure

```
src/
├── data/
│   └── content.ts        ← ✏️ TOUT LE CONTENU (à éditer)
├── map/
│   └── mapConfig.ts      ← géométrie de la carte (calculée automatiquement)
├── components/
│   ├── WorldMap.tsx      ← caméra, parallaxe, chemin SVG, décor
│   ├── LevelNode.tsx     ← un point cliquable sur la carte
│   ├── DetailPanel.tsx   ← panneau de détail (modale / bottom sheet)
│   ├── SkillsScreen.tsx  ← fiche de personnage RPG (compétences)
│   ├── Hud.tsx           ← identité, progression par monde, aides clavier
│   └── IntroOverlay.tsx  ← écran d'arrivée animé
├── hooks/
│   └── useKeyboardNav.ts ← navigation clavier globale
├── App.tsx               ← orchestration (état actif / ouvert / intro)
└── index.css             ← design tokens (couleurs, polices)
```

## Thème clair / sombre

Un bouton en haut à droite bascule entre les deux thèmes. Le choix est
persisté dans `localStorage` et le défaut suit `prefers-color-scheme`.
Les deux palettes sont définies dans [`src/index.css`](src/index.css)
(`@theme` pour le clair, bloc `:root[data-theme="dark"]` pour le sombre).

## Navigation

- **← / →** : point précédent / suivant (la caméra suit)
- **↑ / ↓** : monde précédent / suivant
- **Entrée / espace** : ouvrir le point actif · **Échap** : fermer
- **Clic / tap** sur un point : s'y rendre et l'ouvrir
- **Glisser** la carte pour l'explorer librement
- Barre du bas : cliquer un segment saute au monde correspondant

## Accessibilité

- Navigation clavier complète, focus visibles, `aria-current` / `aria-live`
- `prefers-reduced-motion` respecté partout (caméra instantanée, jauges sans
  animation, pas de pulsations)
- Jauges de compétences exposées en `role="meter"` avec valeurs
