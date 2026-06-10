import { useEffect, useRef } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { profile, skillCategories } from '../data/content'

interface SkillsScreenProps {
  open: boolean
  accent: string
  onClose: () => void
}

/**
 * Écran Compétences — "fiche de personnage" façon RPG.
 * Les jauges s'animent à l'entrée mais les valeurs sont FIGÉES :
 * aucune interaction ne peut les modifier (volontaire, voir content.ts).
 */
export function SkillsScreen({ open, accent, onClose }: SkillsScreenProps) {
  const reduceMotion = useReducedMotion()
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) panelRef.current?.focus()
  }, [open])

  const initials = profile.name
    .split(' ')
    .map((w) => w[0])
    .join('')

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Fiche de personnage — compétences"
          tabIndex={-1}
          className="fixed inset-0 z-40 overflow-y-auto bg-[#131316] text-[#f5f5f4] outline-none"
          initial={{ opacity: 0, ...(reduceMotion ? {} : { scale: 1.04 }) }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, ...(reduceMotion ? {} : { scale: 1.02 }) }}
          transition={{ duration: reduceMotion ? 0.1 : 0.45, ease: [0.32, 0.72, 0, 1] }}
        >
          {/* Halo d'ambiance */}
          <div
            className="pointer-events-none fixed inset-x-0 top-0 h-[55vh]"
            style={{ background: `radial-gradient(ellipse at 50% -20%, ${accent}2e 0%, transparent 65%)` }}
            aria-hidden
          />

          <div className="relative mx-auto max-w-5xl px-6 py-12 sm:px-10 sm:py-16">
            {/* En-tête */}
            <div className="flex items-start justify-between">
              <motion.p
                className="text-[11px] font-semibold tracking-[0.35em] uppercase"
                style={{ color: accent }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: reduceMotion ? 0 : 0.15 }}
              >
                Monde 4 · Fiche de personnage
              </motion.p>
              <button
                type="button"
                onClick={onClose}
                aria-label="Fermer la fiche de personnage"
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                  <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Carte de personnage */}
            <motion.div
              className="mt-8 flex flex-col gap-6 rounded-3xl border border-white/10 bg-white/[0.04] p-7 sm:flex-row sm:items-center sm:gap-8 sm:p-8"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduceMotion ? 0 : 0.2, duration: 0.5, ease: 'easeOut' }}
            >
              <div
                className="font-display flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl text-3xl italic"
                style={{ backgroundColor: `${accent}26`, color: accent }}
                aria-hidden
              >
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-display text-4xl italic">{profile.name}</h2>
                <p className="mt-1 text-sm text-white/60">
                  {profile.characterClass} · {profile.location}
                </p>
                {/* Barre d'XP : pleine et verrouillée — pas d'upgrade possible */}
                <div className="mt-4 flex items-center gap-3">
                  <span
                    className="rounded-full px-3 py-1 text-xs font-bold tracking-wider"
                    style={{ backgroundColor: accent, color: '#131316' }}
                  >
                    NIV. {profile.characterLevel}
                  </span>
                  <div
                    className="h-2 flex-1 overflow-hidden rounded-full bg-white/10"
                    role="presentation"
                  >
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: accent }}
                      initial={{ width: reduceMotion ? '100%' : '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ delay: 0.5, duration: reduceMotion ? 0 : 1, ease: 'easeOut' }}
                    />
                  </div>
                  <span className="text-xs font-semibold tracking-wider text-white/50">EXP MAX</span>
                </div>
              </div>
            </motion.div>

            {/* Catégories de compétences */}
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              {skillCategories.map((cat, ci) => (
                <motion.section
                  key={cat.id}
                  className="rounded-3xl border border-white/10 bg-white/[0.04] p-7"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: reduceMotion ? 0 : 0.3 + ci * 0.1, duration: 0.5, ease: 'easeOut' }}
                  aria-label={`Compétences — ${cat.name}`}
                >
                  <h3 className="text-[11px] font-semibold tracking-[0.3em] text-white/50 uppercase">
                    {cat.name}
                  </h3>
                  <ul className="mt-5 space-y-5">
                    {cat.skills.map((skill, si) => (
                      <li key={skill.name}>
                        <div className="flex items-baseline justify-between gap-3">
                          <span className="text-sm font-semibold">{skill.name}</span>
                          <span className="text-xs tabular-nums text-white/50">
                            {skill.rank ? `${skill.rank} · ` : ''}
                            <span className="font-bold text-white/80">{skill.level}</span>/100
                          </span>
                        </div>
                        <div
                          className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10"
                          role="meter"
                          aria-valuenow={skill.level}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label={`${skill.name} : ${skill.level} sur 100`}
                        >
                          <motion.div
                            className="h-full rounded-full"
                            style={{ backgroundColor: accent }}
                            initial={{ width: reduceMotion ? `${skill.level}%` : '0%' }}
                            animate={{ width: `${skill.level}%` }}
                            transition={{
                              delay: reduceMotion ? 0 : 0.45 + ci * 0.1 + si * 0.07,
                              duration: reduceMotion ? 0 : 0.9,
                              ease: [0.32, 0.72, 0, 1],
                            }}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                </motion.section>
              ))}
            </div>

            {/* Note : stats volontairement non améliorables */}
            <motion.p
              className="mt-8 flex items-center justify-center gap-2 text-center text-xs text-white/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: reduceMotion ? 0 : 0.9 }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                <rect x="2" y="5" width="8" height="6" rx="1.5" stroke="currentColor" />
                <path d="M4 5V3.5a2 2 0 1 1 4 0V5" stroke="currentColor" />
              </svg>
              Statistiques verrouillées — elles s’améliorent en jouant, pas en cliquant.
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
