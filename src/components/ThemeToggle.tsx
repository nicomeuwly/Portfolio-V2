import { motion, useReducedMotion } from 'framer-motion'
import type { Theme } from '../hooks/useTheme'
import { Sun, Moon } from 'lucide-react'

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
        <Sun size={20} />
      ) : (
        /* Lune */
        <Moon size={20} />
      )}
    </motion.button>
  )
}
