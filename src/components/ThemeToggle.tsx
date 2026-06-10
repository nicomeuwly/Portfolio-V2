import { motion, useReducedMotion } from 'framer-motion'
import type { Theme } from '../hooks/useTheme'

interface ThemeToggleProps {
  theme: Theme
  /** Masqué (fondu) quand une fenêtre est ouverte par-dessus la carte,
      pour ne jamais chevaucher son bouton de fermeture. */
  visible: boolean
  onToggle: () => void
}

/** Bouton clair/sombre — appartient à l'écran "carte" uniquement. */
export function ThemeToggle({ theme, visible, onToggle }: ThemeToggleProps) {
  const reduceMotion = useReducedMotion()
  const dark = theme === 'dark'
  return (
    <motion.button
      type="button"
      onClick={onToggle}
      aria-label={dark ? 'Passer au thème clair' : 'Passer au thème sombre'}
      aria-pressed={dark}
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      className="fixed top-6 right-6 z-[60] flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-line bg-surface/75 text-ink shadow-lg shadow-ink/5 backdrop-blur-md transition-transform hover:scale-105 active:scale-95 sm:top-8 sm:right-10"
      style={{ pointerEvents: visible ? 'auto' : 'none' }}
      animate={{ opacity: visible ? 1 : 0, scale: visible ? 1 : 0.85 }}
      transition={{ duration: reduceMotion ? 0 : 0.25, ease: 'easeOut' }}
    >
      {dark ? (
        /* Soleil */
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
          <circle cx="12" cy="12" r="4.5" />
          <path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8" />
        </svg>
      ) : (
        /* Lune */
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11Z" />
        </svg>
      )}
    </motion.button>
  )
}
