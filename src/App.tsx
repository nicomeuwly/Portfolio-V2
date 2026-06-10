import { useCallback, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { WorldMap } from './components/WorldMap'
import { DetailPanel } from './components/DetailPanel'
import { SkillsScreen } from './components/SkillsScreen'
import { Hud } from './components/Hud'
import { IntroOverlay } from './components/IntroOverlay'
import { ThemeToggle } from './components/ThemeToggle'
import { useKeyboardNav } from './hooks/useKeyboardNav'
import { useTheme } from './hooks/useTheme'
import { positionedNodes, worldAnchors } from './map/mapConfig'

/**
 * Orchestration générale : intro → carte → panneaux.
 * L'état est minimal : point actif, point ouvert, intro passée.
 */
export default function App() {
  const { theme, toggle: toggleTheme } = useTheme()
  const [introDone, setIntroDone] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const lastIndex = positionedNodes.length - 1
  const openNode = openIndex !== null ? positionedNodes[openIndex] : null
  const skillsOpen = openNode?.node.kind === 'skills'

  /* ------------------------------ Actions -------------------------------- */

  const select = useCallback((i: number) => {
    setActiveIndex(Math.max(0, Math.min(i, positionedNodes.length - 1)))
  }, [])

  // Clic sur un point : la caméra s'y rend ET son détail s'ouvre.
  const openAt = useCallback((i: number) => {
    setActiveIndex(i)
    setOpenIndex(i)
  }, [])

  const close = useCallback(() => setOpenIndex(null), [])

  const jumpWorld = useCallback(
    (direction: 1 | -1) => {
      const currentWorld = positionedNodes[activeIndex].worldIndex
      const target = worldAnchors[currentWorld + direction]
      if (target) setActiveIndex(target.startIndex)
    },
    [activeIndex],
  )

  /* --------------------------- Clavier global ---------------------------- */

  useKeyboardNav({
    enabled: introDone,
    panelOpen: openIndex !== null,
    onPrev: () => select(activeIndex - 1),
    onNext: () => select(activeIndex + 1),
    onPrevWorld: () => jumpWorld(-1),
    onNextWorld: () => jumpWorld(1),
    onOpen: () => setOpenIndex(activeIndex),
    onClose: close,
  })

  /* -------------------------------- Rendu -------------------------------- */

  return (
    <main className="h-full" aria-label="Portfolio — carte interactive">
      <WorldMap activeIndex={activeIndex} introDone={introDone} onNodeClick={openAt} />

      <Hud activeIndex={activeIndex} introDone={introDone} onJump={select} />

      {/* Visible uniquement sur l'écran carte : masqué dès qu'une fenêtre
          (détail ou compétences) est ouverte par-dessus. */}
      <ThemeToggle theme={theme} visible={openIndex === null} onToggle={toggleTheme} />

      {/* Panneau de détail classique (tous les points sauf `kind: 'skills'`) */}
      <DetailPanel pn={skillsOpen ? null : openNode} onClose={close} />

      {/* Écran RPG des compétences */}
      <SkillsScreen
        open={skillsOpen}
        accent={openNode?.world.accent ?? '#8a63d2'}
        onClose={close}
      />

      <AnimatePresence>
        {!introDone && <IntroOverlay onStart={() => setIntroDone(true)} />}
      </AnimatePresence>

      {/* Position courante pour les lecteurs d'écran */}
      <p className="sr-only" aria-live="polite">
        {positionedNodes[activeIndex].world.title} — {positionedNodes[activeIndex].node.title},
        point {activeIndex + 1} sur {lastIndex + 1}
      </p>
    </main>
  )
}
