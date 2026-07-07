import { useEffect, useRef } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import type { PositionedNode } from '../map/mapConfig'
import { Calendar, MapPin, X } from 'lucide-react'

interface DetailPanelProps {
  /** Le point ouvert, ou null si fermé. */
  pn: PositionedNode | null
  onClose: () => void
}

/**
 * Panneau de détail d'un point : carte centrée sur desktop,
 * feuille montante (bottom sheet) sur mobile.
 */
export function DetailPanel({ pn, onClose }: DetailPanelProps) {
  const reduceMotion = useReducedMotion()
  const panelRef = useRef<HTMLDivElement>(null)

  // Focus sur le panneau à l'ouverture (accessibilité clavier / lecteur d'écran)
  useEffect(() => {
    if (pn) panelRef.current?.focus()
  }, [pn])

  return (
    <AnimatePresence>
      {pn && (
        <div className="fixed inset-0 z-40 flex items-end justify-center sm:items-center sm:p-6">
          {/* Fond assombri / flouté */}
          <motion.div
            className="absolute inset-0 bg-ink/10 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.3 }}
            onClick={onClose}
            aria-hidden
          />

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`panel-${pn.node.id}-title`}
            tabIndex={-1}
            className="relative max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-surface p-8 shadow-2xl outline-none sm:rounded-3xl sm:p-10"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 56, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 40, scale: 0.97 }}
            transition={
              reduceMotion
                ? { duration: 0.1 }
                : { type: 'spring', stiffness: 320, damping: 28 }
            }
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer le panneau"
              className="absolute top-5 right-5 z-10 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-surface/80 text-ink-soft backdrop-blur-sm transition-colors hover:bg-paper hover:text-ink"
            >
              <X size={24} />
            </button>

            {/* Image bannière (optionnelle, `variant: 'banner'` — défaut) */}
            {pn.node.image && pn.node.image.variant !== 'portrait' && (
              <img
                src={pn.node.image.src}
                alt={pn.node.image.alt}
                className="mb-7 aspect-video w-full rounded-2xl border border-line object-cover"
              />
            )}

            <div
              className={
                pn.node.image?.variant === 'portrait'
                  ? 'flex flex-col items-start justify-between gap-3'
                  : undefined
              }
            >
              {/* Pastille du monde */}
              <span
                className="inline-flex mb-6 items-center gap-2 rounded-full px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.18em] uppercase"
                style={{ backgroundColor: `${pn.world.accent}15`, color: pn.world.accent }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: pn.world.accent }}
                  aria-hidden
                />
                {pn.world.label} · {pn.world.title}
              </span>
              <div className="w-full flex justify-between items-center">
                <div className="min-w-0">
                  <h2
                    id={`panel-${pn.node.id}-title`}
                    className="font-display text-4xl text-ink italic sm:text-[2.6rem]"
                  >
                    {pn.node.title}
                  </h2>
                  {pn.node.subtitle && (
                    <div className="flex gap-4 mt-3 items-center flex-wrap">
                      <p className="flex items-center gap-2 text-sm font-medium text-ink-soft">{pn.node.period && (<MapPin size={16} />)}{pn.node.subtitle}</p>
                      {pn.node.period && (
                        <p className="flex items-center gap-2 text-sm font-medium text-ink-soft"><Calendar size={16} />{pn.node.period}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Photo portrait (optionnelle, `variant: 'portrait'`) —
                  décalée sous le bouton de fermeture pour ne pas le chevaucher */}
                {pn.node.image?.variant === 'portrait' && (
                  <img
                    src={pn.node.image.src}
                    alt={pn.node.image.alt}
                    className="h-24 w-24 shrink-0 rounded-2xl border border-line object-cover shadow-md sm:h-28 sm:w-28"
                    style={{ backgroundColor: `${pn.world.accent}15` }}
                  />
                )}
              </div>
            </div>

            <p className="mt-5 leading-relaxed text-ink/85">{pn.node.description}</p>

            {pn.node.tags && pn.node.tags.length > 0 && (
              <ul className="mt-6 flex flex-wrap gap-2" aria-label="Tags">
                {pn.node.tags.map((tag) => (
                  <li
                    key={tag}
                    className="rounded-full border border-line bg-paper px-3.5 py-1.5 text-xs font-medium text-ink/75"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            )}

            {pn.node.links && pn.node.links.length > 0 && (
              <div className="mt-7 flex flex-wrap gap-3">
                {pn.node.links.map((link, i) => (
                  <a
                    key={link.url}
                    href={link.url}
                    target={link.url.startsWith('mailto:') ? undefined : '_blank'}
                    rel="noreferrer"
                    className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-transform hover:-translate-y-0.5 ${i === 0
                      ? 'text-white'
                      : 'border border-line text-ink hover:border-ink/30'
                      }`}
                    style={i === 0 ? { backgroundColor: pn.world.accent } : undefined}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
