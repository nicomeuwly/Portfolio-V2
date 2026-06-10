import { useEffect } from 'react'

interface KeyboardNavOptions {
  /** Désactive tout (ex. pendant l'intro). */
  enabled: boolean
  /** Un panneau est ouvert : seules les touches de fermeture agissent. */
  panelOpen: boolean
  onPrev: () => void
  onNext: () => void
  onPrevWorld: () => void
  onNextWorld: () => void
  onOpen: () => void
  onClose: () => void
}

/**
 * Navigation clavier globale sur la carte :
 *  ← / →  point précédent / suivant
 *  ↑ / ↓  monde précédent / suivant
 *  ↵ / espace  ouvrir le point actif
 *  échap  fermer le panneau
 */
export function useKeyboardNav({
  enabled,
  panelOpen,
  onPrev,
  onNext,
  onPrevWorld,
  onNextWorld,
  onOpen,
  onClose,
}: KeyboardNavOptions) {
  useEffect(() => {
    if (!enabled) return

    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      // Ne pas interférer avec un champ de saisie ou un lien focalisé via Tab.
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return

      if (panelOpen) {
        if (e.key === 'Escape') {
          e.preventDefault()
          onClose()
        }
        return
      }

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault()
          onNext()
          break
        case 'ArrowLeft':
          e.preventDefault()
          onPrev()
          break
        case 'ArrowDown':
          e.preventDefault()
          onNextWorld()
          break
        case 'ArrowUp':
          e.preventDefault()
          onPrevWorld()
          break
        case 'Enter':
        case ' ':
          // Laisser les boutons/liens focalisés gérer leur propre activation.
          if (target.tagName === 'BUTTON' || target.tagName === 'A') return
          e.preventDefault()
          onOpen()
          break
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [enabled, panelOpen, onPrev, onNext, onPrevWorld, onNextWorld, onOpen, onClose])
}
