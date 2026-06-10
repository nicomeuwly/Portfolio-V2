import { useEffect } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { profile } from '../data/content'

interface IntroOverlayProps {
  onStart: () => void
}

/**
 * Écran d'arrivée : révélation mot à mot du nom, puis bascule vers la carte
 * (travelling de caméra géré par WorldMap quand `introDone` passe à true).
 */
export function IntroOverlay({ onStart }: IntroOverlayProps) {
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') onStart()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onStart])

  const words = profile.role.split(' ')

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-paper/80 px-6 text-center backdrop-blur-2xl"
      exit={{ opacity: 0, transition: { duration: reduceMotion ? 0.1 : 0.7, ease: 'easeInOut' } }}
    >
      {/* Grand anneau décoratif */}
      <motion.div
        className="pointer-events-none absolute h-[34rem] w-[34rem] rounded-full border border-ink/8"
        initial={reduceMotion ? { opacity: 1 } : { scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        aria-hidden
      />

      <motion.p
        className="text-[11px] font-semibold tracking-[0.4em] text-ink-soft uppercase"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: reduceMotion ? 0 : 0.2, duration: 0.7, ease: 'easeOut' }}
      >
        Portfolio · Carte interactive
      </motion.p>

      <h1 className="font-display mt-6 text-6xl text-ink italic sm:text-8xl" aria-label={profile.role}>
        {words.map((word, i) => (
          <motion.span
            key={i}
            className="inline-block"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 36, rotate: 2 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{
              delay: reduceMotion ? 0 : 0.35 + i * 0.14,
              duration: 0.8,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {word}
            {i < words.length - 1 && ' '}
          </motion.span>
        ))}
      </h1>

      <motion.p
        className="mt-6 max-w-md text-base leading-relaxed text-ink-soft sm:text-lg"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: reduceMotion ? 0 : 0.85, duration: 0.7, ease: 'easeOut' }}
      >
        {profile.tagline}
      </motion.p>

      <motion.button
        type="button"
        onClick={onStart}
        className="mt-12 cursor-pointer rounded-full bg-ink px-8 py-4 text-sm font-semibold text-paper shadow-xl shadow-ink/20 transition-transform hover:scale-[1.04] active:scale-[0.98]"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: reduceMotion ? 0 : 1.05, duration: 0.7, ease: 'easeOut' }}
      >
        Commencer l’exploration
        <span className="ml-3 rounded-md bg-white/15 px-1.5 py-0.5 text-xs" aria-hidden>
          ↵
        </span>
      </motion.button>

      <motion.p
        className="absolute bottom-8 text-xs text-ink-soft"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reduceMotion ? 0 : 1.4 }}
      >
        ← → pour explorer la carte · Entrée pour ouvrir un point
      </motion.p>
    </motion.div>
  )
}
