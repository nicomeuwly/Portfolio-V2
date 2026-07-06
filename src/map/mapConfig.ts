/**
 * ============================================================================
 *  CONFIGURATION DE LA CARTE
 * ============================================================================
 *  La géométrie de la carte (position des points, tracé du chemin, ancres
 *  des mondes) est calculée automatiquement à partir de `worlds` dans
 *  src/data/content.ts. Ajouter un monde ou un point ne demande AUCUNE
 *  modification ici — ajustez seulement les constantes `MAP` si vous voulez
 *  changer le rythme général de la carte.
 *
 *  La carte est *orientable* : `buildLayout(vertical, …)` produit soit un
 *  parcours horizontal (desktop, de gauche à droite), soit vertical (mobile,
 *  de haut en bas). La logique de navigation (indices, mondes) est identique
 *  dans les deux cas — seules les coordonnées x/y changent.
 * ============================================================================
 */

import { worlds, type WorldData, type LevelNodeData } from '../data/content'

/** Réglages globaux de la carte (unités : pixels du "plan" de la carte). */
export const MAP = {
  /** Distance entre deux points consécutifs (le long de l'axe principal). */
  nodeSpacing: 250,
  /** Espace supplémentaire entre la fin d'un monde et le début du suivant. */
  worldGap: 340,
  /** Position de référence du chemin sur l'axe transverse (horizontal). */
  baseY: 540,
  /** Amplitude de l'ondulation transverse du chemin — parcours horizontal. */
  waveAmplitude: 85,
  /** Amplitude de l'ondulation transverse — parcours vertical (écran étroit). */
  waveAmplitudeV: 52,
  /** Marges avant le premier point / après le dernier. */
  padStart: 460,
  padEnd: 460,
  /** Hauteur de référence du plan en mode horizontal. */
  height: 1080,
}

/** Un point positionné sur la carte, enrichi de son contexte. */
export interface PositionedNode {
  node: LevelNodeData
  world: WorldData
  worldIndex: number
  /** Index du point au sein de son monde (0-based). */
  nodeIndex: number
  /** Index global du point sur tout le chemin (0-based). */
  globalIndex: number
  x: number
  y: number
}

/** Ancre d'un monde : sert au titre flottant et au HUD. */
export interface WorldAnchor {
  world: WorldData
  worldIndex: number
  /** Position du titre du monde (dans le repère du plan). */
  x: number
  y: number
  /** Index global du premier point du monde (cible de navigation). */
  startIndex: number
  nodeCount: number
}

/* ----------------------- Tracé SVG lissé du chemin ------------------------ */

interface Pt {
  x: number
  y: number
}

/** Courbe lisse (Catmull-Rom → Bézier) passant par tous les points. */
export function smoothPath(pts: Pt[]): string {
  if (pts.length < 2) return ''
  let d = `M ${pts[0].x} ${pts[0].y}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2] ?? p2
    const c1x = p1.x + (p2.x - p0.x) / 6
    const c1y = p1.y + (p2.y - p0.y) / 6
    const c2x = p2.x - (p3.x - p1.x) / 6
    const c2y = p2.y - (p3.y - p1.y) / 6
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2.x} ${p2.y}`
  }
  return d
}

/* --------------------- Construction de la géométrie ---------------------- */

export interface Layout {
  nodes: PositionedNode[]
  anchors: WorldAnchor[]
  pathD: string
  /** Dimensions du plan (unités plan, avant mise à l'échelle écran). */
  planeW: number
  planeH: number
  vertical: boolean
  /** Fraction [0..1] du chemin parcourue au point d'index global `i`. */
  progressAt: (i: number) => number
}

/**
 * Construit la géométrie pour une orientation donnée.
 * `crossExtent` est la taille de l'axe transverse en unités de plan
 * (largeur du plan en vertical ; ignoré en horizontal où l'on utilise
 * `MAP.height`).
 */
export function buildLayout(vertical: boolean, crossExtent: number): Layout {
  const amp = vertical ? MAP.waveAmplitudeV : MAP.waveAmplitude
  const crossSize = vertical ? crossExtent : MAP.height
  const crossCenter = vertical ? crossSize / 2 : MAP.baseY

  const nodes: PositionedNode[] = []
  let main = MAP.padStart
  let g = 0

  worlds.forEach((world, worldIndex) => {
    world.nodes.forEach((node, nodeIndex) => {
      // Ondulation douce pour casser la ligne droite (le chemin "respire").
      // En vertical, la phase est réinitialisée à chaque monde pour que le
      // 1er point de chaque monde soit centré horizontalement (sin(0) = 0).
      const wave = Math.sin((vertical ? nodeIndex : g) * 1.05) * amp
      const cross = crossCenter + wave
      const mainOffset = vertical ? node.offset?.y ?? 0 : node.offset?.x ?? 0
      const crossOffset = vertical ? node.offset?.x ?? 0 : node.offset?.y ?? 0
      const mainPos = main + mainOffset
      const crossPos = cross + crossOffset
      nodes.push({
        node,
        world,
        worldIndex,
        nodeIndex,
        globalIndex: g,
        x: vertical ? crossPos : mainPos,
        y: vertical ? mainPos : crossPos,
      })
      main += MAP.nodeSpacing
      g += 1
    })
    main += MAP.worldGap
  })

  const last = nodes[nodes.length - 1]
  const mainEnd = (vertical ? last.y : last.x) + MAP.padEnd

  const anchors: WorldAnchor[] = worlds.map((world, worldIndex) => {
    const pts = nodes.filter((p) => p.worldIndex === worldIndex)
    const mainOf = (p: PositionedNode) => (vertical ? p.y : p.x)
    // Horizontal : titre centré sur la largeur du monde, remonté au-dessus.
    // Vertical : titre centré sur l'écran, posé avant le 1er point avec assez
    // de marge pour qu'un tagline sur 2 lignes ne colle pas au point.
    const anchorMain = vertical
      ? Math.min(...pts.map(mainOf)) - 220
      : pts.reduce((s, p) => s + mainOf(p), 0) / pts.length
    const anchorCross = vertical ? crossCenter : Math.min(...pts.map((p) => p.y)) - 195
    return {
      world,
      worldIndex,
      x: vertical ? anchorCross : anchorMain,
      y: vertical ? anchorMain : anchorCross,
      startIndex: pts[0].globalIndex,
      nodeCount: pts.length,
    }
  })

  const cumulative: number[] = [0]
  for (let i = 1; i < nodes.length; i++) {
    const a = nodes[i - 1]
    const b = nodes[i]
    cumulative.push(cumulative[i - 1] + Math.hypot(b.x - a.x, b.y - a.y))
  }
  const total = cumulative[cumulative.length - 1]
  const progressAt = (i: number) =>
    total === 0 ? 0 : cumulative[Math.max(0, Math.min(i, cumulative.length - 1))] / total

  return {
    nodes,
    anchors,
    pathD: smoothPath(nodes),
    planeW: vertical ? crossSize : mainEnd,
    planeH: vertical ? mainEnd : crossSize,
    vertical,
    progressAt,
  }
}

/* -------------- Géométrie horizontale par défaut (référence) -------------- */
/* Exposée pour la logique de navigation (indices, mondes), indépendante de
   l'orientation. La carte reconstruit la géométrie verticale à la volée. */

const base = buildLayout(false, 0)

export const positionedNodes = base.nodes
export const worldAnchors = base.anchors
/** Largeur totale du plan de la carte (mode horizontal). */
export const mapWidth = base.planeW
export const fullPathD = base.pathD

/** Fraction [0..1] du chemin parcourue au point d'index global `i`. */
export function progressAt(i: number): number {
  return base.progressAt(i)
}
