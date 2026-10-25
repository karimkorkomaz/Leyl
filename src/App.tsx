import { lazy, Suspense } from 'react'
import { labels } from './content'
import { followEdition } from './motion/editionLook'
import { gsap, ScrollTrigger, useGSAP } from './motion/gsap'
import { startLenis } from './motion/lenis'
import { MEDIA } from './motion/media'
import { markReady } from './motion/ready'
import { sceneState } from './motion/sceneState'
import { Editions } from './sections/Editions'
import { Finale } from './sections/Finale'
import { Flacon } from './sections/Flacon'
import { Hero } from './sections/Hero'
import { Notes } from './sections/Notes'
import { Cursor } from './ui/Cursor'
import { EditionControl } from './ui/EditionControl'
import { Grain } from './ui/Grain'
import { Nav } from './ui/Nav'
import { Preloader } from './ui/Preloader'

// three.js and R3F are most of the bundle: load them as their own chunk so the DOM (and later the
// preloader) paints first. The import starts at module load, not on first render, so nothing waits.
const stageModule = import('./scene/Stage')
stageModule.then(() => markReady('stage'))
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
      <a className="skip-link" href="#main">
        {labels.skip}
      </a>
      <Nav />
      <main id="main" className="page" tabIndex={-1}>
        <Hero />
        <Flacon />
        <Notes />
        <Editions />
        <Finale />
      </main>
      <EditionControl />
      <Grain />
      <Cursor />
      <Preloader />
    </>
  )
}
