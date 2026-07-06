import { useEffect, useRef } from 'react'

interface ScrollNavOptions {
  /** Actif uniquement sur la carte (intro passée, aucun panneau ouvert). */
  enabled: boolean
  onNext: () => void
  onPrev: () => void
}

/** Un « cran » de navigation ne se déclenche pas plus vite que ce délai (ms). */
const COOLDOWN = 340
/** Ignore les micro-mouvements de trackpad sous ce seuil. */
const MIN_DELTA = 8

/**
 * Fait avancer / reculer le parcours d'un point à la molette ou au trackpad,
 * au même titre que les flèches. Un flick = un point ; en défilement continu,
 * un point est franchi à chaque `COOLDOWN`.
 *
 * ⚠️ Les écrans tactiles n'émettent pas d'événement `wheel` : sur mobile, le
 * déplacement se fait par glissement (drag) et non par ce hook.
 */
export function useScrollNav({ enabled, onNext, onPrev }: ScrollNavOptions) {
  const locked = useRef(false)

  useEffect(() => {
    if (!enabled) return

    const onWheel = (e: WheelEvent) => {
      if (locked.current) return
      // Prend l'axe dominant : molette verticale (desktop) comme trackpad.
      const delta =
        Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX
      if (Math.abs(delta) < MIN_DELTA) return

      locked.current = true
      window.setTimeout(() => {
        locked.current = false
      }, COOLDOWN)

      if (delta > 0) onNext()
      else onPrev()
    }

    window.addEventListener('wheel', onWheel, { passive: true })
    return () => window.removeEventListener('wheel', onWheel)
  }, [enabled, onNext, onPrev])
}
