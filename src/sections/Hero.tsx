import { useRef } from 'react'
import { brand, labels, taglineLines } from '../content'
import { gsap, useGSAP } from '../motion/gsap'
import { MEDIA } from '../motion/media'
import { introReady } from '../motion/ready'
import { heroIntro, heroIntroInitial, heroScroll } from '../motion/timelines/hero'
import './Hero.css'

// The bottle and the giant LEYL live in the 3D scene behind this section; the DOM only carries
// what sits in front of them: the tagline and the scroll cue.
export function Hero() {
  const root = useRef<HTMLElement>(null)
  const tagline = useRef<HTMLParagraphElement>(null)
  const cue = useRef<HTMLDivElement>(null)
  const foot = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const els = { root: root.current!, tagline: tagline.current!, cue: cue.current!, foot: foot.current! }
      const mm = gsap.matchMedia()

      mm.add(MEDIA.motionOK, (ctx) => {
        heroIntroInitial(els)
        heroScroll(els, { fadeFoot: true })
        const play = ctx.add('play', () => heroIntro(els))
        let live = true
        introReady.then(() => live && play())
        return () => {
          live = false
        }
      })

      // Reduced motion: everything already in its final state; the wordmark still leaves with the hero.
      mm.add(MEDIA.reducedMotion, () => heroScroll(els, { fadeFoot: false }))
    },
    { scope: root },
  )

  return (
    <section ref={root} id="hero" className="section hero" aria-labelledby="hero-title">
      <h1 id="hero-title" className="sr-only">
        {brand.name}, {brand.product}. {brand.tagline}
      </h1>
      <div ref={foot} className="hero__foot">
        <p ref={tagline} className="hero__tagline" aria-hidden="true">
          <span className="hero__line">{taglineLines[0]}</span> <span className="hero__line">{taglineLines[1]}</span>
        </p>
        <div ref={cue} className="hero__cue" aria-hidden="true">
          <span>{labels.scroll}</span>
          <span className="hero__cue-track">
            <span className="hero__cue-line" />
          </span>
        </div>
      </div>
    </section>
  )
}
