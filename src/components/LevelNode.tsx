import { motion, useReducedMotion } from 'framer-motion'
import type { PositionedNode } from '../map/mapConfig'

interface LevelNodeProps {
  pn: PositionedNode
  active: boolean
  visited: boolean
  introDone: boolean
  onClick: () => void
}

/**
 * Un point (niveau) cliquable sur la carte.
 * Cercle pour les points classiques, losange pour l'écran Compétences.
 */
export function LevelNode({ pn, active, visited, introDone, onClick }: LevelNodeProps) {
  const reduceMotion = useReducedMotion()
  const { node, world, nodeIndex, globalIndex } = pn
  const isSkills = node.kind === 'skills'
  const accent = world.accent

  return (
    <motion.button
      type="button"
      onClick={onClick}
      className="group absolute z-10 flex -translate-x-1/2 -translate-y-8 cursor-pointer flex-col items-center focus-visible:outline-none"
      style={{ left: pn.x, top: pn.y }}
      initial={{ scale: 0, opacity: 0 }}
      animate={introDone ? { scale: 1, opacity: 1 } : {}}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { delay: 0.35 + globalIndex * 0.055, type: 'spring', stiffness: 260, damping: 20 }
      }
      aria-label={`${world.title} — ${node.title}${active ? ' (point actuel)' : ''}`}
      aria-current={active ? 'step' : undefined}
    >
      {/* Anneau de pulsation sur le point actif */}
      {active && !reduceMotion && (
        <motion.span
          className="absolute top-0 h-16 w-16 rounded-full"
          style={{ border: `2px solid ${accent}` }}
          animate={{ scale: [1, 1.55], opacity: [0.5, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
          aria-hidden
        />
      )}

      {/* La pastille */}
      <motion.span
        className={`flex h-16 w-16 items-center justify-center border text-lg font-bold transition-shadow duration-300 group-focus-visible:ring-2 group-focus-visible:ring-ink group-focus-visible:ring-offset-4 group-focus-visible:ring-offset-paper ${
          isSkills ? 'rotate-45 rounded-[1.15rem]' : 'rounded-full'
        }`}
        style={
          visited
            ? {
                backgroundColor: accent,
                borderColor: 'transparent',
                color: '#fff',
                boxShadow: `0 14px 34px -12px ${accent}99`,
              }
            : {
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-line)',
                color: 'var(--color-ink)',
                boxShadow: '0 10px 28px -14px rgba(0,0,0,0.35)',
              }
        }
        whileHover={reduceMotion ? undefined : { scale: 1.1, y: -4 }}
        whileTap={reduceMotion ? undefined : { scale: 0.94 }}
      >
        <span className={isSkills ? '-rotate-45' : ''}>{isSkills ? '✦' : nodeIndex + 1}</span>
      </motion.span>

      {/* Libellé sous le point */}
      <span className="mt-4 max-w-40 text-center">
        <span className="block text-sm leading-snug font-semibold text-ink">{node.title}</span>
        {node.subtitle && (
          <span className="mt-0.5 block text-xs text-ink-soft">{node.subtitle}</span>
        )}
      </span>
    </motion.button>
  )
}
