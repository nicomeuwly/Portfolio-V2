import { useEffect, useMemo, useState } from 'react'
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from 'framer-motion'
import {
  MAP,
  fullPathD,
  mapWidth,
  positionedNodes,
  progressAt,
  worldAnchors,
} from '../map/mapConfig'
import { LevelNode } from './LevelNode'

interface WorldMapProps {
  activeIndex: number
  introDone: boolean
  /** Clic sur un point : sélection + ouverture du détail. */
  onNodeClick: (globalIndex: number) => void
}

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v))

/**
 * La carte du monde. Un seul grand plan 2D ; la "caméra" est une simple
 * translation animée (transform → GPU) qui centre le point actif.
 * Trois couches de parallaxe : fond (halos), décor (collines), carte.
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

  // Échelle responsive : légèrement réduite sur petit écran, mais en restant
  // assez grande pour que les points et libellés soient confortablement
  // lisibles — la carte se parcourt horizontalement de toute façon.
  const scale = viewport.w < 640 ? 0.85 : viewport.w < 1024 ? 0.9 : 1
  const planeW = mapWidth * scale
  const planeH = MAP.height * scale

  /* ------------------------------ Caméra --------------------------------- */
  const camX = useMotionValue(0)
  const camY = useMotionValue(0)

  const cameraTarget = (index: number) => {
    const n = positionedNodes[index]
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
      // Pendant l'intro : caméra posée légèrement en retrait du départ,
      // pour un travelling d'entrée au moment du "Commencer".
      camX.set(x - 220)
      camY.set(y)
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
  }, [activeIndex, introDone, scale, viewport.w, viewport.h, reduceMotion])

  // Parallaxe : les couches de fond suivent la caméra plus lentement.
  const bgX = useTransform(camX, (v) => v * 0.3)
  const midX = useTransform(camX, (v) => v * 0.65)

  const dragEnabled = planeW > viewport.w || planeH > viewport.h
  const dragConstraints = {
    left: Math.min(viewport.w - planeW, (viewport.w - planeW) / 2),
    right: Math.max(0, (viewport.w - planeW) / 2),
    top: Math.min(viewport.h - planeH, (viewport.h - planeH) / 2),
    bottom: Math.max(0, (viewport.h - planeH) / 2),
  }

  /* --------------------------- Décor (mémoïsé) --------------------------- */
  // Bande de "collines" ancrée au BAS DE L'ÉCRAN (pas au plan de la carte),
  // pour que le relief touche toujours le bord inférieur quel que soit
  // l'écran. Seule la translation horizontale suit la parallaxe.
  const GROUND_H = 260
  const groundPaths = useMemo(() => {
    // Chaque couche couvre TOUTE la largeur de la carte (0 → mapWidth) ;
    // la profondeur vient d'un déphasage de l'onde, pas d'une translation
    // (une translation laisserait une arête verticale visible au bord).
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

  const active = positionedNodes[activeIndex]
  const pathProgress = progressAt(activeIndex)

  return (
    <div className="fixed inset-0 overflow-hidden" aria-label="Carte du portfolio">
      {/* ------------------ Couche 1 : halos colorés (fond) ----------------- */}
      <motion.div className="absolute top-0 left-0 h-full" style={{ x: bgX, width: planeW }} aria-hidden>
        <div
          style={{ transform: `scale(${scale})`, transformOrigin: '0 0', width: mapWidth, height: MAP.height }}
          className="relative"
        >
          {worldAnchors.map((a) => (
            <div
              key={a.world.id}
              className="absolute rounded-full blur-3xl"
              style={{
                left: a.x - 340,
                top: 140,
                width: 680,
                height: 680,
                background: `radial-gradient(circle, ${a.world.accent}14 0%, transparent 70%)`,
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* ------- Couche 2 : collines, ancrées au bas de l'écran ------------- */}
      <motion.div className="absolute bottom-0 left-0" style={{ x: midX, width: planeW }} aria-hidden>
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

      {/* --------------------- Couche 3 : la carte elle-même ---------------- */}
      <motion.div
        className="absolute top-0 left-0 will-change-transform"
        style={{ x: camX, y: camY, width: planeW, height: planeH }}
        drag={dragEnabled && !reduceMotion}
        dragConstraints={dragConstraints}
        dragElastic={0.06}
        dragMomentum={false}
      >
        <div
          style={{ transform: `scale(${scale})`, transformOrigin: '0 0', width: mapWidth, height: MAP.height }}
          className="relative"
        >
          {/* Chemin : tracé pointillé complet + portion parcourue */}
          <svg width={mapWidth} height={MAP.height} className="absolute inset-0" aria-hidden>
            <motion.path
              d={fullPathD}
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
              d={fullPathD}
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
          {worldAnchors.map((a, i) => (
            <motion.div
              key={a.world.id}
              className="absolute -translate-x-1/2 text-center"
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
          {positionedNodes.map((pn) => (
            <LevelNode
              key={pn.node.id}
              pn={pn}
              active={pn.globalIndex === activeIndex}
              visited={pn.globalIndex <= activeIndex}
              introDone={introDone}
              onClick={() => onNodeClick(pn.globalIndex)}
            />
          ))}
        </div>
      </motion.div>
    </div>
  )
}
