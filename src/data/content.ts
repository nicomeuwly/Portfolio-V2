/**
 * ============================================================================
 *  CONTENU DU PORTFOLIO — FICHIER UNIQUE À ÉDITER
 * ============================================================================
 *
 *  Tout le contenu du site est centralisé ici : profil, mondes, points
 *  (niveaux), projets, étapes de parcours et compétences.
 *
 *  ➜ POUR MODIFIER UN TEXTE : éditez simplement les chaînes ci-dessous.
 *  ➜ POUR AJOUTER UN POINT  : ajoutez un objet dans `nodes` du monde voulu.
 *  ➜ POUR AJOUTER UN MONDE  : ajoutez un objet dans `worlds` (voir le
 *    gabarit commenté tout en bas du fichier). La carte, le chemin et la
 *    navigation se recalculent automatiquement.
 *
 *  Aucune autre partie du code n'a besoin d'être touchée.
 * ============================================================================
 */

/* ----------------------------- Types ------------------------------------- */

/** Lien externe affiché dans le panneau de détail d'un point. */
export interface LinkItem {
  label: string
  url: string
}

/**
 * Un "point" (niveau) sur le chemin d'un monde.
 * `kind: 'skills'` est spécial : il ouvre l'écran de stats RPG
 * au lieu du panneau de détail classique.
 */
export interface LevelNodeData {
  id: string
  title: string
  /** Ligne secondaire (dates, rôle, contexte…) — optionnelle. */
  subtitle?: string
  description: string
  tags?: string[]
  links?: LinkItem[]
  /**
   * Image affichée dans le panneau de détail. Placez le fichier dans
   * `public/` et référencez-le par son chemin absolu.
   * - `variant: 'banner'` (défaut) : grande image 16:9 en haut du panneau,
   *   idéale pour les projets (≥ 800px de large conseillé).
   * - `variant: 'portrait'` : photo carrée arrondie à côté du titre,
   *   idéale pour une photo de profil (≥ 320×320px conseillé).
   */
  image?: { src: string; alt: string; variant?: 'banner' | 'portrait' }
  /**
   * Symbole affiché dans la pastille à la place du numéro (utile quand un
   * monde n'a qu'un seul point, où "1" n'aurait pas de sens). Ex. '@', '✉', '★'.
   * Le point `kind: 'skills'` affiche toujours '✦' automatiquement.
   */
  icon?: string
  kind?: 'standard' | 'skills'
  /** Décalage manuel (px, dans le repère de la carte) si besoin d'ajuster. */
  offset?: { x?: number; y?: number }
}

/** Un "monde" = une thématique, avec ses points reliés par le chemin. */
export interface WorldData {
  id: string
  /** Petit libellé au-dessus du titre, ex. "Monde 1". */
  label: string
  title: string
  /** Phrase d'ambiance affichée sous le titre du monde. */
  tagline: string
  /** Couleur d'accent du monde (hex). Restez sobre : tons désaturés. */
  accent: string
  nodes: LevelNodeData[]
}

/** Une compétence de l'écran RPG. `level` est figé, sur 100. */
export interface Skill {
  name: string
  level: number
  /** Libellé du rang, ex. "Maîtrise", "Avancé"… */
  rank?: string
}

export interface SkillCategory {
  id: string
  name: string
  skills: Skill[]
}

/* ----------------------------- Profil ------------------------------------ */

export const profile = {
  name: 'Alex Martin',
  role: 'Développeur Web Créatif',
  tagline: 'Je conçois des interfaces vivantes, précises et mémorables.',
  /** Affiché sur la fiche de personnage (écran Compétences). */
  characterClass: 'Full-Stack · spécialisation Front-End',
  characterLevel: 5, // ex. années d'expérience
  location: 'Lausanne, Suisse',
}

/* ----------------------------- Mondes ------------------------------------ */

export const worlds: WorldData[] = [
  /* ------------------------- Monde 1 — Présentation ----------------------- */
  {
    id: 'presentation',
    label: 'Monde 1',
    title: 'Présentation',
    tagline: 'Le point de départ de l’aventure.',
    accent: '#4f6df5',
    nodes: [
      {
        id: 'bienvenue',
        title: 'Bienvenue',
        subtitle: 'Appuyez sur Entrée pour commencer',
        description:
          'Bienvenue sur ma carte. Chaque monde raconte une partie de mon travail : qui je suis, d’où je viens, ce que je construis et ce que je maîtrise. Avancez de point en point — bonne exploration.',
        tags: ['Portfolio', 'Exploration'],
      },
      {
        id: 'qui-suis-je',
        title: 'Qui suis-je',
        subtitle: 'Joueur 1',
        image: { src: '/portrait.svg', alt: 'Portrait d’Alex Martin', variant: 'portrait' },
        description:
          'Développeur web basé à Lausanne, je transforme des idées en produits soignés. Mon terrain de jeu favori : la frontière entre design et code, là où une interface devient une expérience.',
        tags: ['Front-End', 'Design', 'Produit'],
      },
      {
        id: 'philosophie',
        title: 'Ma philosophie',
        subtitle: 'Règle du jeu n°1',
        description:
          'Le détail fait la différence : une micro-interaction juste, une typographie précise, une animation qui respire. Je crois aux interfaces sobres qui surprennent — jamais l’inverse.',
        tags: ['Craft', 'Micro-interactions', 'Accessibilité'],
      },
    ],
  },

  /* --------------------------- Monde 2 — Parcours ------------------------- */
  {
    id: 'parcours',
    label: 'Monde 2',
    title: 'Parcours',
    tagline: 'Chaque étape débloque la suivante.',
    accent: '#d9730d',
    nodes: [
      {
        id: 'bachelor',
        title: 'Bachelor Informatique',
        subtitle: '2018 – 2021 · HES-SO',
        description:
          'Formation en ingénierie logicielle avec une spécialisation web. Projet de diplôme : une plateforme collaborative temps réel — premier déclic pour les interfaces animées.',
        tags: ['Formation', 'Ingénierie logicielle'],
      },
      {
        id: 'stage-studio',
        title: 'Stage — Studio Pixel',
        subtitle: '2021 · 6 mois',
        description:
          'Immersion dans un studio de design interactif. Intégration de sites vitrines haut de gamme, premières animations complexes en production, et l’obsession du pixel-perfect.',
        tags: ['Stage', 'Intégration', 'Animation'],
      },
      {
        id: 'nova-agency',
        title: 'Développeur Front-End — Nova',
        subtitle: '2021 – 2023 · Nova Agency',
        description:
          'Développement d’applications React pour des clients e-commerce et culture. Mise en place d’un design system interne et montée en compétence sur la performance web.',
        tags: ['React', 'Design System', 'Performance'],
      },
      {
        id: 'freelance',
        title: 'Full-Stack — Freelance',
        subtitle: '2023 – aujourd’hui',
        description:
          'Indépendant : je conçois et développe des produits web de bout en bout pour des startups et studios. Du prototype à la mise en production, avec un soin particulier pour l’expérience.',
        tags: ['Freelance', 'Produit', 'TypeScript'],
      },
    ],
  },

  /* ---------------------------- Monde 3 — Projets ------------------------- */
  {
    id: 'projets',
    label: 'Monde 3',
    title: 'Projets',
    tagline: 'Les niveaux que j’ai construits moi-même.',
    accent: '#2f9e63',
    nodes: [
      {
        id: 'atlas',
        title: 'Atlas',
        subtitle: 'SaaS · Tableau de bord analytics',
        description:
          'Plateforme d’analytics pour équipes produit : visualisations interactives, rapports partageables et exploration de données en temps réel. Conçue pour rester fluide avec des millions de points.',
        image: { src: '/projects/atlas.svg', alt: 'Aperçu du tableau de bord Atlas' },
        tags: ['React', 'TypeScript', 'D3.js', 'Node.js'],
        links: [
          { label: 'Voir la démo', url: 'https://example.com/atlas' },
          { label: 'Code source', url: 'https://github.com/example/atlas' },
        ],
      },
      {
        id: 'brio',
        title: 'Brio',
        subtitle: 'App mobile · Apprentissage musical',
        description:
          'Application d’apprentissage du solfège gamifiée : exercices progressifs, retours audio en temps réel et système de séries quotidiennes. 40 000 téléchargements la première année.',
        image: { src: '/projects/brio.svg', alt: 'Écran de l’application Brio' },
        tags: ['React Native', 'Expo', 'Audio API'],
        links: [{ label: 'Étude de cas', url: 'https://example.com/brio' }],
      },
      {
        id: 'kiosk',
        title: 'Kiosk',
        subtitle: 'E-commerce · Marketplace locale',
        description:
          'Marketplace mettant en relation producteurs locaux et habitants : catalogue temps réel, paiement intégré et logistique de retrait. Pensée mobile-first, livrée en huit semaines.',
        image: { src: '/projects/kiosk.svg', alt: 'Page d’accueil de la marketplace Kiosk' },
        tags: ['Next.js', 'Stripe', 'PostgreSQL'],
        links: [
          { label: 'Site en ligne', url: 'https://example.com/kiosk' },
          { label: 'Code source', url: 'https://github.com/example/kiosk' },
        ],
      },
      {
        id: 'pulse',
        title: 'Pulse',
        subtitle: 'Open source · Design system',
        description:
          'Design system open source orienté motion : composants React accessibles, tokens de mouvement et documentation interactive. Utilisé par une dizaine de studios.',
        image: { src: '/projects/pulse.svg', alt: 'Documentation du design system Pulse' },
        tags: ['Design System', 'Framer Motion', 'Storybook'],
        links: [{ label: 'Documentation', url: 'https://example.com/pulse' }],
      },
    ],
  },

  /* -------------------------- Monde 4 — Compétences ----------------------- */
  /* Ce monde est spécial : son point `kind: 'skills'` ouvre l'écran de
     stats RPG (les valeurs sont définies dans `skillCategories` plus bas). */
  {
    id: 'competences',
    label: 'Monde 4',
    title: 'Compétences',
    tagline: 'La fiche de personnage.',
    accent: '#8a63d2',
    nodes: [
      {
        id: 'stats',
        title: 'Fiche de personnage',
        subtitle: 'Statistiques verrouillées',
        description:
          'Mes compétences, présentées comme un écran de stats. Les valeurs sont figées : elles s’améliorent en jouant, pas en cliquant.',
        kind: 'skills',
      },
    ],
  },

  /* ---------------------------- Monde 5 — Contact ------------------------- */
  {
    id: 'contact',
    label: 'Monde final',
    title: 'Contact',
    tagline: 'Et si on jouait en coopération ?',
    accent: '#d6628f',
    nodes: [
      {
        id: 'contact',
        title: 'Me contacter',
        subtitle: 'Niveau bonus — toujours ouvert',
        icon: '@',
        description:
          'Un projet, une mission, ou simplement envie d’échanger sur les interfaces animées ? Ma boîte mail est le dernier checkpoint de cette carte — et le début d’une autre partie.',
        tags: ['Disponible pour missions freelance'],
        links: [
          { label: 'alex.martin@example.com', url: 'mailto:alex.martin@example.com' },
          { label: 'GitHub', url: 'https://github.com/example' },
          { label: 'LinkedIn', url: 'https://linkedin.com/in/example' },
        ],
      },
    ],
  },

  /* -------------------------- GABARIT — Nouveau monde ---------------------
  {
    id: 'mon-nouveau-monde',          // identifiant unique (kebab-case)
    label: 'Monde 6',
    title: 'Titre du monde',
    tagline: 'Une phrase d’ambiance.',
    accent: '#5b8def',                // couleur d'accent (ton désaturé)
    nodes: [
      {
        id: 'mon-point',
        title: 'Titre du point',
        subtitle: 'Sous-titre optionnel',
        description: 'Texte affiché dans le panneau de détail.',
        tags: ['Tag 1', 'Tag 2'],
        links: [{ label: 'Un lien', url: 'https://…' }],
      },
    ],
  },
  ------------------------------------------------------------------------- */
]

/* --------------------------- Compétences (RPG) ---------------------------- */
/* Affichées sur l'écran "Fiche de personnage". `level` est sur 100 et FIGÉ :
   il n'existe volontairement aucun moyen de l'« améliorer » dans l'UI.      */

export const skillCategories: SkillCategory[] = [
  {
    id: 'frontend',
    name: 'Front-End',
    skills: [
      { name: 'React / Next.js', level: 92, rank: 'Maîtrise' },
      { name: 'TypeScript', level: 88, rank: 'Maîtrise' },
      { name: 'CSS & Animations', level: 90, rank: 'Maîtrise' },
      { name: 'Accessibilité', level: 78, rank: 'Avancé' },
    ],
  },
  {
    id: 'backend',
    name: 'Back-End',
    skills: [
      { name: 'Node.js', level: 76, rank: 'Avancé' },
      { name: 'API REST / GraphQL', level: 72, rank: 'Avancé' },
      { name: 'PostgreSQL', level: 64, rank: 'Solide' },
    ],
  },
  {
    id: 'outils',
    name: 'Outils & DevOps',
    skills: [
      { name: 'Git / GitHub', level: 86, rank: 'Maîtrise' },
      { name: 'Vite / Tooling', level: 84, rank: 'Avancé' },
      { name: 'CI/CD', level: 68, rank: 'Solide' },
      { name: 'Docker', level: 60, rank: 'Solide' },
    ],
  },
  {
    id: 'design',
    name: 'Design & Motion',
    skills: [
      { name: 'Figma', level: 80, rank: 'Avancé' },
      { name: 'Design systems', level: 76, rank: 'Avancé' },
      { name: 'Motion design', level: 82, rank: 'Avancé' },
    ],
  },
]
