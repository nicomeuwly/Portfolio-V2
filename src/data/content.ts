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

/* ----------------------------- Variables --------------------------------- */
const BLOB_PUBLIC_URL = "https://v5nmkkbjcswqwbun.public.blob.vercel-storage.com"

/* ----------------------------- Types ------------------------------------- */

/** Lien externe affiché dans le panneau de détail d'un point. */
export interface LinkItem {
  label: string
  url: string
}

/**
 * Un "point" (niveau) sur le chemin d'un monde.
 * `kind: "skills"` est spécial : il ouvre l'écran de stats RPG
 * au lieu du panneau de détail classique.
 */
export interface LevelNodeData {
  id: string
  title: string
  /** Ligne secondaire (dates, rôle, contexte…) — optionnelle. */
  subtitle?: string
  period?: string
  description: string
  tags?: string[]
  links?: LinkItem[]
  /**
   * Image affichée dans le panneau de détail. Placez le fichier dans
   * `public/` et référencez-le par son chemin absolu.
   * - `variant: "banner"` (défaut) : grande image 16:9 en haut du panneau,
   *   idéale pour les projets (≥ 800px de large conseillé).
   * - `variant: "portrait"` : photo carrée arrondie à côté du titre,
   *   idéale pour une photo de profil (≥ 320×320px conseillé).
   */
  image?: { src: string; alt: string; variant?: "banner" | "portrait" }
  /**
   * Symbole affiché dans la pastille à la place du numéro (utile quand un
   * monde n'a qu'un seul point, où "1" n'aurait pas de sens). Ex. "@", "✉", "★".
   * Le point `kind: "skills"` affiche toujours "✦" automatiquement.
   */
  icon?: string
  kind?: "standard" | "skills"
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
  name: "Nicolas Meuwly",
  role: "Développeur Frontend / Full Stack",
  avatar: { src: "/portrait.webp", alt: "Portrait de Nicolas Meuwly" },
  tagline:
    "Je conçois des interfaces modernes axées qualité, performance et expérience utilisateur principalement avec Next.js, TypeScript et Tailwind CSS.",
  /** Affiché sur la fiche de personnage (écran Compétences). */
  characterClass: "Front-End · en perfectionnement Full Stack",
  location: "Cugy FR, Suisse",
}

/* ----------------------------- Mondes ------------------------------------ */

export const worlds: WorldData[] = [
  /* ------------------------- Monde 1 — Présentation ----------------------- */
  {
    id: "presentation",
    label: "Monde 1",
    title: "Présentation",
    tagline: "Le point de départ de l'aventure.",
    accent: "#4f6df5",
    nodes: [
      {
        id: "bienvenue",
        title: "Bienvenue",
        subtitle: "Appuyez sur Enter ou cliquez pour commencer",
        description:
          "Bienvenue sur ma carte. Chaque monde raconte une partie de mon travail : qui je suis, mon parcours, mes projets et mes compétences. Avancez de point en point, bonne exploration !",
        tags: ["Portfolio", "Exploration"],
      },
      {
        id: "qui-suis-je",
        title: "Qui suis-je",
        subtitle: "Joueur 1",
        image: { src: "/portrait.webp", alt: "Portrait de Nicolas Meuwly", variant: "portrait" },
        description:
          "Développeur frontend passionné par la conception d'interfaces modernes avec Next.js et Vue.js, en cours de perfectionnement en compétences full stack. J'ai une expérience pratique en développement web, intégration d'API et automatisation. Basé à Cugy FR, en Suisse.",
        tags: ["Front-End", "Full Stack", "UX/UI"],
      },
      {
        id: "philosophie",
        title: "Ma façon de travailler",
        subtitle: "Règle du jeu n°1",
        description:
          "Qualité, performance et expérience utilisateur guident chacun de mes projets. J'aime automatiser ce qui peut l'être, soigner les détails d'une interface et apprendre en continu de nouveaux outils pour rester à jour.",
        tags: ["Qualité", "Performance", "Automatisation"],
      },
    ],
  },

  /* --------------------------- Monde 2 — Parcours ------------------------- */
  /* Étapes en ordre chronologique (les plus anciennes à gauche). */
  {
    id: "parcours",
    label: "Monde 2",
    title: "Parcours",
    tagline: "Chaque étape débloque la suivante.",
    accent: "#d9730d",
    nodes: [
      {
        id: "cfc",
        title: "CFC employé de commerce + Maturité prof.",
        subtitle: "GYB, Payerne",
        period: "2015 - 2019",
        description:
          "Formation commerciale complétée par une maturité professionnelle. Premières bases en organisation, rigueur et relation client, qui structurent encore ma manière de travailler aujourd'hui.",
        tags: ["Formation", "Commerce"],
        links: [{ label: "CFC", url: `${BLOB_PUBLIC_URL}/CFC.pdf` }, { label: "Maturité", url: `${BLOB_PUBLIC_URL}/MPC.pdf` }, { label: "Bulletin", url: `${BLOB_PUBLIC_URL}/GYB_Bulletin.pdf` }, { label: "Prix de fin d'études", url: `${BLOB_PUBLIC_URL}/GYB_Prix.pdf` }],
      },
      {
        id: "bachelor",
        title: "Bachelor en Ingénierie des Médias",
        subtitle: "HEIG-VD, Yverdon-les-Bains",
        period: "2021 - 2024",
        description:
          "Bachelor of Science HES-SO en Ingénierie des Médias : développement web, design d'interaction, gestion de projet et conception de produits numériques. Le déclic pour le développement frontend.",
        tags: ["HES-SO", "Ingénierie des Médias", "Web"],
        links: [{ label: "Bachelor", url: `${BLOB_PUBLIC_URL}/Bachelor.pdf` }, { label: "Attestation", url: `${BLOB_PUBLIC_URL}/HEIG-VD_Attestation.pdf` }, { label: "Bulletin", url: `${BLOB_PUBLIC_URL}/HEIG-VD_Bulletin.pdf` }],
      },
      {
        id: "bachelor-projet",
        title: "Travail de Bachelor",
        subtitle: "Digitec Galaxus AG, Lausanne",
        period: "05.2024 - 09.2024",
        description:
          "Conception et développement d'une solution digitale métier chez Digitec Galaxus AG : design UX/UI, automatisation de traitements de données, analyse des besoins, gestion de projet et amélioration continue.",
        tags: ["UX/UI", "Automatisation", "Gestion de projet"],
        links: [{ label: "Maquette interactive", url: "https://chk.me/kMp71OX" }, { label: "Rapport", url: `${BLOB_PUBLIC_URL}/TB_Rapport.pdf` }, { label: "Repo Backend", url: "https://github.com/nicomeuwly/dg-targetstock" }, { label: "Repo Frontend", url: "https://github.com/nicomeuwly/dg-targetstock-frontend" }],
      },
      {
        id: "uty3",
        title: "Stagiaire Développeur Web / IA",
        subtitle: "UTY3, Villars-sur-Glâne",
        period: "08.2025 - 01.2026",
        description:
          "Développement et maintenance de sites sous WordPress, intégration frontend et outils tiers (DocuSign, GTM, reCAPTCHA), automatisation de workflows avec n8n, mise en production, optimisation et amélioration UX/UI.",
        tags: ["WordPress", "Intégration", "n8n", "IA"],
        links: [{ label: "Certificat", url: `${BLOB_PUBLIC_URL}/UTY3_Certificat.pdf` }],
      },
      {
        id: "inox",
        title: "Développeur Back-End",
        subtitle: "Inox Communication, Neuchâtel",
        period: "04.2026 - aujourd'hui",
        description:
          "Développement et maintenance de sites sous WordPress et Drupal, migration de sites legacy en local, mise en place de workflows CI/CD pour automatiser les déploiements, et veille sur de nouveaux outils et solutions CMS.",
        tags: ["Drupal", "WordPress", "CI/CD", "Back-End"],
      },
    ],
  },

  /* ---------------------------- Monde 3 — Projets ------------------------- */
  /* ⚠️ Le CV ne contenait pas de liste de projets : remplace / complète
     librement ces entrées par tes vrais projets. Un point peut recevoir une
     image bannière via `image: { src, alt }` (fichier dans public/). */
  {
    id: "projets",
    label: "Monde 3",
    title: "Projets",
    tagline: "Les niveaux que j'ai construits moi-même.",
    accent: "#2f9e63",
    nodes: [
      {
        id: "portfolio-v1",
        title: "Portfolio v1",
        subtitle: "Site personnel",
        description: "Description en cours de rédaction...",
        tags: [],
        links: [{ label: "Voir le site", url: "https://portfolio-five-hazel-u7lpx1vytt.vercel.app/" }, { label: "Code source", url: "https://github.com/nicomeuwly/portfolio" }],
      },
      {
        id: "planning-viewer",
        title: "Planning-Viewer",
        subtitle: "Outil de visualisation de plannings",
        description: "Description en cours de rédaction...",
        tags: [],
        links: [{ label: "Voir le site", url: "https://nicomeuwly.github.io/Planning-Viewer/" }, { label: "Code source", url: "https://github.com/nicomeuwly/Planning-Viewer" }],
      },
      {
        id: "jobquest",
        title: "JobQuest",
        subtitle: "Application de suivi des recherches d'emploi",
        description: "Description en cours de rédaction...",
        tags: [],
        links: [{ label: "Code source", url: "https://github.com/nicomeuwly/JobQuest" }],
      },
      {
        id: "trackour",
        title: "TrackHour",
        subtitle: "Application de suivi de heures de travail",
        description: "Description en cours de rédaction...",
        tags: [],
        links: [{ label: "Voir le site", url: "https://trackhour.app/fr" }, { label: "Code source", url: "https://github.com/nicomeuwly/TrackHour" }],
      },
      {
        id: "portfolio-v2",
        title: "Portfolio v2",
        subtitle: "Site personnel amélioré",
        description: "Description en cours de rédaction...",
        tags: [],
        links: [{ label: "Voir le site", url: "https://portfolio.nicomeuwly.ch" }, { label: "Code source", url: "https://github.com/nicomeuwly/portfolio-v2" }],
      },
    ],
  },

  /* -------------------------- Monde 4 — Compétences ----------------------- */
  /* Ce monde est spécial : son point `kind: "skills"` ouvre l'écran de
     stats RPG (les valeurs sont définies dans `skillCategories` plus bas). */
  {
    id: "competences",
    label: "Monde 4",
    title: "Compétences",
    tagline: "La fiche de personnage.",
    accent: "#8a63d2",
    nodes: [
      {
        id: "stats",
        title: "Fiche de personnage",
        subtitle: "Statistiques verrouillées",
        description:
          "Mes compétences, présentées comme un écran de stats. Les valeurs sont figées : elles s'améliorent en jouant, pas en cliquant.",
        kind: "skills",
      },
    ],
  },

  /* ---------------------------- Monde 5 — Contact ------------------------- */
  {
    id: "contact",
    label: "Monde final",
    title: "Contact",
    tagline: "Et si on jouait en coopération ?",
    accent: "#d6628f",
    nodes: [
      {
        id: "contact",
        title: "Me contacter",
        subtitle: "Niveau bonus",
        icon: "@",
        description:
          "Un projet, une mission, ou simplement envie d'échanger sur le développement web et les interfaces ? Voici le dernier checkpoint de cette carte et peut-être le début d'une autre partie.",
        tags: [],
        links: [
          { label: "Me contacter", url: "mailto:contact@nicomeuwly.ch" },
          { label: "LinkedIn", url: "https://linkedin.com/in/nicolas-meuwly" },
          { label: "GitHub", url: "https://github.com/nicomeuwly" },
        ],
      },
    ],
  },

  /* -------------------------- GABARIT — Nouveau monde ---------------------
  {
    id: "mon-nouveau-monde",          // identifiant unique (kebab-case)
    label: "Monde 6",
    title: "Titre du monde",
    tagline: "Une phrase d'ambiance.",
    accent: "#5b8def",                // couleur d'accent (ton désaturé)
    nodes: [
      {
        id: "mon-point",
        title: "Titre du point",
        subtitle: "Sous-titre optionnel",
        description: "Texte affiché dans le panneau de détail.",
        tags: ["Tag 1", "Tag 2"],
        links: [{ label: "Un lien", url: "https://…" }],
      },
    ],
  },
  ------------------------------------------------------------------------- */
]

/* --------------------------- Compétences (RPG) ---------------------------- */
/* Affichées sur l'écran "Fiche de personnage". `level` est sur 100 et FIGÉ :
   il n'existe volontairement aucun moyen de l'« améliorer » dans l'UI.
   Les niveaux techniques sont des estimations : ajuste-les à ta convenance. */

export const skillCategories: SkillCategory[] = [
  {
    id: "frontend",
    name: "Front-End",
    skills: [
      { name: "React / Next.js", level: 80 },
      { name: "Vue.js", level: 60 },
      { name: "TypeScript", level: 80 },
      { name: "HTML & CSS", level: 90 },
      { name: "TailwindCSS", level: 80 },
      { name: "Angular", level: 40 },
    ],
  },
  {
    id: "backend",
    name: "Back-End & Data",
    skills: [
      { name: "Node.js", level: 70 },
      { name: "API REST", level: 60 },
      { name: "PHP", level: 50 },
      { name: "Python / FastAPI", level: 50 },
      { name: "Prisma", level: 60 },
      { name: "PostgreSQL / MongoDB", level: 60 },
    ],
  },
  {
    id: "outils",
    name: "Outils & DevOps",
    skills: [
      { name: "Git / GitHub", level: 88 },
      { name: "Docker", level: 66 },
      { name: "CI/CD", level: 68 },
      { name: "n8n (automatisation)", level: 78 },
      { name: "WordPress / Drupal", level: 80 },
      { name: "Figma", level: 80 },
    ],
  },
  {
    id: "langues",
    name: "Langues",
    skills: [
      { name: "Français", level: 100, rank: "Maternelle" },
      { name: "Anglais", level: 80, rank: "Niveau B2" },
      { name: "Allemand", level: 50, rank: "Niveau B1" },
    ],
  },
]
