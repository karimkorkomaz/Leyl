import { useRef } from 'react'
import { brand } from '../content'
import { gsap, useGSAP } from '../motion/gsap'
import { MEDIA } from '../motion/media'
import { editionsPose, finalePose } from '../motion/poses'
import { loaded } from '../motion/ready'
import { finaleStatic, finaleTimeline } from '../motion/timelines/finale'
import { Footer } from './Footer'
import './Finale.css'

// The closing poster: the bottle home in its hero pose, upper half; "Wear the night." beneath it.
export function Finale() {
  const root = useRef<HTMLElement>(null)
  const line = useRef<HTMLParagraphElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      const conditions = { desktop: MEDIA.desktop, mobile: MEDIA.mobile, motionOK: MEDIA.motionOK, reduced: MEDIA.reducedMotion }
      mm.add(conditions, (ctx) => {
        const { mobile, reduced } = ctx.conditions as { mobile: boolean; reduced: boolean }
        const pose = mobile ? finalePose.mobile : finalePose.desktop
        if (reduced) {
          // Under reduced motion the Editions framing never applied, so the delta is from the hero's.
          finaleStatic(root.current!, pose, { camZ: 0, targetY: 0 })
          return
        }
        gsap.set(line.current, { autoAlpha: 0 })
        const build = ctx.add('build', () => {
          gsap.set(line.current, { autoAlpha: 1 })
          finaleTimeline(root.current!, line.current!, pose, mobile ? editionsPose.mobile : editionsPose.desktop)
        })
        let live = true
        loaded.then(() => live && build())
        return () => {
          live = false
        }
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} id="finale" className="section finale" aria-label={brand.tagline}>
      {/* The footer lives inside the pinned stage: the last screen is the poster with its credits,
          and nothing scrolls the closing line over the (fixed) bottle afterwards. */}
      <div className="pin finale__stage">
        <p ref={line} className="finale__line">
          {brand.tagline}
        </p>
        <Footer />
      </div>
    </section>
  )
}
