import { useEffect, useMemo, useState } from 'react'
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from 'framer-motion'
import { buildLayout, mapWidth } from '../map/mapConfig'
import { LevelNode } from './LevelNode'

interface WorldMapProps {
  activeIndex: number
  introDone: boolean
  /** Clic sur un point : sélection + ouverture du détail. */
  onNodeClick: (globalIndex: number) => void
}

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v))

/** En-dessous de cette largeur, le parcours passe à la verticale (mobile). */
const VERTICAL_BREAKPOINT = 768

/** Halo coloré de fond derrière chaque monde. */
const HALO_SIZE = 680
/** Décalage vertical du halo sous le titre du monde (unités plan). */
const HALO_DROP = 160

/**
 * La carte du monde. Un seul grand plan 2D ; la "caméra" est une simple
 * translation animée (transform → GPU) qui centre le point actif.
 * Trois couches de parallaxe : fond (halos), décor (collines), carte.
 *
 * L'orientation dépend de la largeur d'écran : parcours horizontal sur
 * desktop, vertical sur mobile. La géométrie est reconstruite en conséquence.
 */
export function WorldMap({ activeIndex, introDone, onNodeClick }: WorldMapProps) {
  const reduceMotion = useReducedMotion()

  /* ----------------------------- Viewport -------------------------------- */
  const [viewport, setViewport] = useState(() => ({
    w: window.innerWidth,
    h: window.innerHeight,
  }))
  useEffect(() => {
    const onResize = () => setViewport({ w: window.innerWidth, h: window.innerHeight })
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const vertical = viewport.w < VERTICAL_BREAKPOINT

  // Échelle responsive : légèrement réduite sur petit écran, mais en restant
  // assez grande pour que les points et libellés soient confortablement lisibles.
  const scale = viewport.w < 640 ? 0.85 : viewport.w < 1024 ? 0.9 : 1

  // Géométrie orientée. En vertical, l'axe transverse (largeur) épouse l'écran
  // pour que le chemin serpente au centre sans déborder.
  const geo = useMemo(
    () => buildLayout(vertical, viewport.w / scale),
    [vertical, viewport.w, scale],
  )

  const planeW = geo.planeW * scale
  const planeH = geo.planeH * scale

  /* ------------------------------ Caméra --------------------------------- */
  const camX = useMotionValue(0)
  const camY = useMotionValue(0)

  const cameraTarget = (index: number) => {
    const n = geo.nodes[index]
    const x =
      planeW <= viewport.w
        ? (viewport.w - planeW) / 2
        : clamp(viewport.w / 2 - n.x * scale, viewport.w - planeW, 0)
    const y =
      planeH <= viewport.h
        ? (viewport.h - planeH) / 2
        : clamp(viewport.h * 0.5 - n.y * scale, viewport.h - planeH, 0)
    return { x, y }
  }

  useEffect(() => {
    const { x, y } = cameraTarget(activeIndex)
    if (!introDone) {
      // Pendant l'intro : caméra posée légèrement en retrait du départ (le long
      // de l'axe principal), pour un travelling d'entrée au "Commencer".
      camX.set(vertical ? x : x - 220)
      camY.set(vertical ? y - 220 : y)
      return
    }
    if (reduceMotion) {
      camX.set(x)
      camY.set(y)
      return
    }
    const opts = { type: 'spring' as const, stiffness: 55, damping: 18, mass: 1.1 }
    const ax = animate(camX, x, opts)
    const ay = animate(camY, y, opts)
    return () => {
      ax.stop()
      ay.stop()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, introDone, scale, viewport.w, viewport.h, reduceMotion, vertical])

  // Parallaxe : les couches de fond suivent la caméra plus lentement, le long
  // de l'axe principal (X en horizontal, Y en vertical).
  const mainCam = vertical ? camY : camX
  const midShift = useTransform(mainCam, (v) => v * 0.65)

  const dragEnabled = planeW > viewport.w || planeH > viewport.h
  const dragAxis: 'x' | 'y' = vertical ? 'y' : 'x'
  const dragConstraints = {
    left: Math.min(viewport.w - planeW, (viewport.w - planeW) / 2),
    right: Math.max(0, (viewport.w - planeW) / 2),
    top: Math.min(viewport.h - planeH, (viewport.h - planeH) / 2),
    bottom: Math.max(0, (viewport.h - planeH) / 2),
  }

  /* --------------------------- Décor (mémoïsé) --------------------------- */
  // Bande de "collines" ancrée au BAS DE L'ÉCRAN (parcours horizontal
  // uniquement — en vertical elle n'a pas de sens et n'est pas rendue).
  const GROUND_H = 260
  const groundPaths = useMemo(() => {
    const makeHills = (base: number, amp: number, phase: number) => {
      const pts: { x: number; y: number }[] = []
      for (let x = 0; x <= mapWidth; x += 260) {
        pts.push({ x, y: base + Math.sin((x + phase) / 340) * amp })
      }
      if (pts[pts.length - 1].x < mapWidth) {
        pts.push({ x: mapWidth, y: base + Math.sin((mapWidth + phase) / 340) * amp })
      }
      let d = `M 0 ${GROUND_H} L ${pts[0].x} ${pts[0].y}`
      for (let i = 1; i < pts.length; i++) {
        const mx = (pts[i - 1].x + pts[i].x) / 2
        d += ` Q ${mx} ${pts[i - 1].y}, ${pts[i].x} ${pts[i].y}`
      }
      d += ` L ${mapWidth} ${GROUND_H} Z`
      return d
    }
    return [makeHills(84, 30, 0), makeHills(112, 26, 480)]
  }, [])

  const active = geo.nodes[activeIndex]
  const pathProgress = geo.progressAt(activeIndex)

  return (
    <div className="fixed inset-0 overflow-hidden" aria-label="Carte du portfolio">
      {/* ------------------ Couche 1 : halos colorés (fond) ----------------- */}
      {/* Verrouillés sur la caméra de la carte (comme les titres) pour rester
          fixes sous leur monde : centrés sur le titre, un peu plus bas. */}
      <motion.div
        className="absolute top-0 left-0"
        style={{ x: camX, y: camY, width: planeW, height: planeH }}
        aria-hidden
      >
        <div
          style={{ transform: `scale(${scale})`, transformOrigin: '0 0', width: geo.planeW, height: geo.planeH }}
          className="relative"
        >
          {geo.anchors.map((a) => (
            <div
              key={a.world.id}
              className="absolute rounded-full blur-3xl"
              style={{
                left: a.x - HALO_SIZE / 2,
                top: a.y + HALO_DROP - HALO_SIZE / 2,
                width: HALO_SIZE,
                height: HALO_SIZE,
                background: `radial-gradient(circle, ${a.world.accent}14 0%, transparent 70%)`,
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* ------- Couche 2 : collines, bas de l'écran (horizontal seul) ------ */}
      {!vertical && (
        <motion.div className="absolute bottom-0 left-0" style={{ x: midShift, width: planeW }} aria-hidden>
          {/* preserveAspectRatio="none" : l'axe X suit l'échelle de la carte,
              l'axe Y reste en pixels écran (hauteur fixe GROUND_H) */}
          <svg
            width={planeW}
            height={GROUND_H}
            viewBox={`0 0 ${mapWidth} ${GROUND_H}`}
            preserveAspectRatio="none"
            className="block"
          >
            <path d={groundPaths[0]} fill="var(--color-ink)" opacity={0.04} />
            <path d={groundPaths[1]} fill="var(--color-ink)" opacity={0.025} />
          </svg>
        </motion.div>
      )}

      {/* --------------------- Couche 3 : la carte elle-même ---------------- */}
      <motion.div
        className="absolute top-0 left-0 will-change-transform"
        style={{ x: camX, y: camY, width: planeW, height: planeH }}
        drag={dragEnabled && !reduceMotion ? dragAxis : false}
        dragConstraints={dragConstraints}
        dragElastic={0.06}
        dragMomentum={false}
      >
        <div
          style={{ transform: `scale(${scale})`, transformOrigin: '0 0', width: geo.planeW, height: geo.planeH }}
          className="relative"
        >
          {/* Chemin : tracé pointillé complet + portion parcourue */}
          <svg width={geo.planeW} height={geo.planeH} className="absolute inset-0" aria-hidden>
            <motion.path
              d={geo.pathD}
              fill="none"
              stroke="var(--color-ink)"
              strokeOpacity={0.16}
              strokeWidth={3}
              strokeLinecap="round"
              strokeDasharray="1 16"
              initial={{ opacity: 0 }}
              animate={{ opacity: introDone ? 1 : 0 }}
              transition={{ duration: 1.2, delay: 0.3 }}
            />
            <motion.path
              d={geo.pathD}
              fill="none"
              stroke="var(--color-ink)"
              strokeWidth={3.5}
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: introDone ? Math.max(pathProgress, 0.001) : 0 }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { type: 'spring', stiffness: 50, damping: 20 }
              }
            />
          </svg>

          {/* Halo "joueur" : disparaît en fondu sur l'ancien point et
              réapparaît sur le nouveau (pas de déplacement visible) */}
          <AnimatePresence>
            <motion.div
              key={activeIndex}
              className="pointer-events-none absolute h-36 w-36 rounded-full blur-2xl"
              style={{
                left: active.x - 72,
                top: active.y - 72,
                backgroundColor: `${active.world.accent}33`,
              }}
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                transition: { duration: reduceMotion ? 0 : 0.5, delay: reduceMotion ? 0 : 0.25 },
              }}
              exit={{ opacity: 0, transition: { duration: reduceMotion ? 0 : 0.35 } }}
              aria-hidden
            />
          </AnimatePresence>

          {/* Titres des mondes */}
          {geo.anchors.map((a, i) => (
            <motion.div
              key={a.world.id}
              className={`absolute -translate-x-1/2 text-center ${
                vertical
                  ? 'rounded-3xl bg-paper/85 px-5 py-4 shadow-sm ring-1 ring-line/50 backdrop-blur-sm'
                  : ''
              }`}
              style={{ left: a.x, top: a.y }}
              initial={{ opacity: 0, y: 18 }}
              animate={introDone ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4 + i * 0.12, duration: 0.7, ease: 'easeOut' }}
            >
              <p
                className="text-[11px] font-semibold tracking-[0.35em] uppercase"
                style={{ color: a.world.accent }}
              >
                {a.world.label}
              </p>
              <h2 className="font-display mt-1 text-5xl text-ink italic">{a.world.title}</h2>
              <p className="mt-2 text-sm text-ink-soft">{a.world.tagline}</p>
            </motion.div>
          ))}

          {/* Les points / niveaux */}
          {geo.nodes.map((pn) => (
            <LevelNode
              key={pn.node.id}
              pn={pn}
              active={pn.globalIndex === activeIndex}
              visited={pn.globalIndex <= activeIndex}
              introDone={introDone}
              vertical={vertical}
              onClick={() => onNodeClick(pn.globalIndex)}
            />
          ))}
        </div>
      </motion.div>
    </div>
  )
}
