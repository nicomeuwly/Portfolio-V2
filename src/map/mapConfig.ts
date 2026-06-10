/**
 * ============================================================================
 *  CONFIGURATION DE LA CARTE
 * ============================================================================
 *  La géométrie de la carte (position des points, tracé du chemin, ancres
 *  des mondes) est calculée automatiquement à partir de `worlds` dans
 *  src/data/content.ts. Ajouter un monde ou un point ne demande AUCUNE
 *  modification ici — ajustez seulement les constantes `MAP` si vous voulez
 *  changer le rythme général de la carte.
 * ============================================================================
 */

import { worlds, type WorldData, type LevelNodeData } from '../data/content'

/** Réglages globaux de la carte (unités : pixels du "plan" de la carte). */
export const MAP = {
  /** Distance horizontale entre deux points consécutifs. */
  nodeSpacing: 250,
  /** Espace supplémentaire entre la fin d'un monde et le début du suivant. */
  worldGap: 340,
  /** Hauteur de référence du chemin. */
  baseY: 540,
  /** Amplitude de l'ondulation verticale du chemin (effet "niveau"). */
  waveAmplitude: 85,
  /** Marges avant le premier point / après le dernier. */
  padStart: 460,
  padEnd: 460,
  /** Hauteur totale du plan de la carte. */
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

/* ------------------- Calcul des positions de chaque point ----------------- */

function computePositions(): PositionedNode[] {
  const out: PositionedNode[] = []
  let x = MAP.padStart
  let g = 0

  worlds.forEach((world, worldIndex) => {
    world.nodes.forEach((node, nodeIndex) => {
      // Ondulation douce pour casser la ligne droite (le chemin "respire").
      const wave = Math.sin(g * 1.05) * MAP.waveAmplitude
      out.push({
        node,
        world,
        worldIndex,
        nodeIndex,
        globalIndex: g,
        x: x + (node.offset?.x ?? 0),
        y: MAP.baseY + wave + (node.offset?.y ?? 0),
      })
      x += MAP.nodeSpacing
      g += 1
    })
    x += MAP.worldGap
  })

  return out
}

export const positionedNodes = computePositions()

/** Largeur totale du plan de la carte. */
export const mapWidth =
  positionedNodes[positionedNodes.length - 1].x + MAP.padEnd

/* --------------------- Ancres des mondes (titres, HUD) -------------------- */

export interface WorldAnchor {
  world: WorldData
  worldIndex: number
  /** Centre horizontal du monde (pour le titre flottant). */
  x: number
  /** Position verticale du titre (au-dessus du point le plus haut). */
  y: number
  /** Index global du premier point du monde (cible de navigation). */
  startIndex: number
  nodeCount: number
}

export const worldAnchors: WorldAnchor[] = worlds.map((world, worldIndex) => {
  const pts = positionedNodes.filter((p) => p.worldIndex === worldIndex)
  const x = pts.reduce((s, p) => s + p.x, 0) / pts.length
  const y = Math.min(...pts.map((p) => p.y)) - 195
  return { world, worldIndex, x, y, startIndex: pts[0].globalIndex, nodeCount: pts.length }
})

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

export const fullPathD = smoothPath(positionedNodes)

/* ----- Fraction de progression (longueur de corde cumulée) par point ------ */

const cumulative: number[] = [0]
for (let i = 1; i < positionedNodes.length; i++) {
  const a = positionedNodes[i - 1]
  const b = positionedNodes[i]
  cumulative.push(cumulative[i - 1] + Math.hypot(b.x - a.x, b.y - a.y))
}
const totalLength = cumulative[cumulative.length - 1]

/** Fraction [0..1] du chemin parcourue au point d'index global `i`. */
export function progressAt(i: number): number {
  return totalLength === 0 ? 0 : cumulative[Math.max(0, Math.min(i, cumulative.length - 1))] / totalLength
}
