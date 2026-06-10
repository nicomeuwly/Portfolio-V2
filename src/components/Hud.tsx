import { motion } from 'framer-motion'
import { profile } from '../data/content'
import { positionedNodes, worldAnchors } from '../map/mapConfig'

interface HudProps {
  activeIndex: number
  introDone: boolean
  /** Saut direct vers un index global (clic sur un segment de monde). */
  onJump: (globalIndex: number) => void
}

/**
 * HUD fixe par-dessus la carte : identité (haut gauche), progression par
 * monde (bas centre, cliquable) et aides clavier (bas droite, desktop).
 */
export function Hud({ activeIndex, introDone, onJump }: HudProps) {
  const activeWorld = positionedNodes[activeIndex].world

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-30"
      initial={{ opacity: 0 }}
      animate={{ opacity: introDone ? 1 : 0 }}
      transition={{ delay: 0.6, duration: 0.8 }}
    >
      {/* Identité */}
      <header className="absolute top-6 left-6 sm:top-8 sm:left-10">
        <p className="font-display text-2xl text-ink italic">{profile.name}</p>
        <p className="mt-0.5 text-xs font-medium tracking-wide text-ink-soft">{profile.role}</p>
      </header>

      {/* Progression par monde */}
      <nav
        className="pointer-events-auto absolute bottom-6 left-1/2 -translate-x-1/2 sm:bottom-8"
        aria-label="Navigation entre les mondes"
      >
        <p className="mb-3 text-center text-[11px] font-semibold tracking-[0.3em] text-ink-soft uppercase">
          {activeWorld.label} · {activeWorld.title}
        </p>
        <div className="flex items-center gap-2 rounded-full border border-line bg-surface/75 px-4 py-3 shadow-lg shadow-ink/5 backdrop-blur-md">
          {worldAnchors.map((a) => {
            const visitedInWorld = Math.max(
              0,
              Math.min(activeIndex - a.startIndex + 1, a.nodeCount),
            )
            const isActive = activeWorld.id === a.world.id
            return (
              <button
                key={a.world.id}
                type="button"
                onClick={() => onJump(a.startIndex)}
                aria-label={`Aller au ${a.world.label} — ${a.world.title}`}
                aria-current={isActive ? 'true' : undefined}
                className="group cursor-pointer rounded-full px-1 py-1"
              >
                <span
                  className="block h-1.5 overflow-hidden rounded-full bg-ink/10 transition-all group-hover:bg-ink/20"
                  style={{ width: a.nodeCount * 14 }}
                >
                  <span
                    className="block h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(visitedInWorld / a.nodeCount) * 100}%`,
                      backgroundColor: a.world.accent,
                    }}
                  />
                </span>
              </button>
            )
          })}
        </div>
      </nav>

      {/* Aides clavier (desktop) */}
      <aside className="absolute right-8 bottom-8 hidden items-center gap-4 text-xs text-ink-soft md:flex">
        <span className="flex items-center gap-1.5">
          <kbd className="rounded-md border border-line bg-surface px-1.5 py-0.5 font-sans shadow-sm">←</kbd>
          <kbd className="rounded-md border border-line bg-surface px-1.5 py-0.5 font-sans shadow-sm">→</kbd>
          explorer
        </span>
        <span className="flex items-center gap-1.5">
          <kbd className="rounded-md border border-line bg-surface px-1.5 py-0.5 font-sans shadow-sm">↵</kbd>
          ouvrir
        </span>
        <span className="flex items-center gap-1.5">
          <kbd className="rounded-md border border-line bg-surface px-1.5 py-0.5 font-sans shadow-sm">esc</kbd>
          fermer
        </span>
      </aside>
    </motion.div>
  )
}
