import { lazy, Suspense } from 'react'
import { followEdition } from './motion/editionLook'
import { gsap, ScrollTrigger, useGSAP } from './motion/gsap'
import { startLenis } from './motion/lenis'
import { MEDIA } from './motion/media'
import { sceneState } from './motion/sceneState'
import { Editions } from './sections/Editions'
import { Finale } from './sections/Finale'
import { Flacon } from './sections/Flacon'
import { Footer } from './sections/Footer'
import { Hero } from './sections/Hero'
import { Notes } from './sections/Notes'
import { EditionControl } from './ui/EditionControl'
import { Nav } from './ui/Nav'

// three.js and R3F are most of the bundle: load them as their own chunk so the DOM (and later the
// preloader) paints first. The import starts at module load, not on first render, so nothing waits.
const stageModule = import('./scene/Stage')
const Stage = lazy(() => stageModule.then((m) => ({ default: m.Stage })))

export default function App() {
  useGSAP(() => {
    const mm = gsap.matchMedia()

    mm.add(MEDIA.motionOK, () => {
      sceneState.idle.float = 1
      sceneState.idle.scent = 1
      return startLenis()
    })
    mm.add(MEDIA.reducedMotion, () => {
      sceneState.idle.float = 0
      sceneState.idle.scent = 0
    })

    document.fonts.ready.then(() => ScrollTrigger.refresh())
    return followEdition()
  })

  return (
    <>
      <Suspense fallback={null}>
        <Stage />
      </Suspense>
      <Nav />
      <main className="page">
        <Hero />
        <Flacon />
        <Notes />
        <Editions />
        <Finale />
      </main>
      <EditionControl />
      <Footer />
    </>
  )
}
