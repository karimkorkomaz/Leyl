import { useRef } from 'react'
import { brand } from '../content'
import { gsap, useGSAP } from '../motion/gsap'
import { setScrollLocked } from '../motion/lenis'
import { MEDIA } from '../motion/media'
import { getProgress, loaded, markRevealed, onProgress } from '../motion/ready'
import './Preloader.css'

/** Long enough for the brand moment to register, even on a warm cache. */
const MIN_SECONDS = 1.6

// Black screen: ليل and LEYL, a thin gold line and a small counter. The counter follows real
// progress (motion/ready.ts), eased so it never jumps. When everything is in, the screen splits
// open (two halves slide apart) and the hero intro begins as it does.
export function Preloader() {
  const root = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const q = gsap.utils.selector(root)
      const fill = q('.preloader__fill')[0] as HTMLElement
      const count = q('.preloader__count')[0] as HTMLElement
      const shown = { p: 0 }
      const render = () => {
        fill.style.transform = `scaleX(${shown.p})`
        count.textContent = String(Math.round(shown.p * 100)).padStart(2, '0')
      }
      const ease = (to: number) => gsap.to(shown, { p: to, duration: 0.9, ease: 'power2.out', onUpdate: render, overwrite: true })

      setScrollLocked(true)
      ease(getProgress())
      const stopListening = onProgress(ease)
      const start = performance.now()
      let live = true

      const mm = gsap.matchMedia()
      mm.add({ motionOK: MEDIA.motionOK, reduced: MEDIA.reducedMotion }, (ctx) => {
        const { reduced } = ctx.conditions as { reduced: boolean }
        const open = ctx.add('open', () => {
          const tl = gsap.timeline({ delay: Math.max(0, MIN_SECONDS - (performance.now() - start) / 1000) })
          tl.to(shown, { p: 1, duration: 0.5, ease: 'power2.inOut', onUpdate: render, overwrite: true })
          if (reduced) {
            tl.add(() => {
              markRevealed()
              setScrollLocked(false)
            })
            tl.to(root.current, { autoAlpha: 0, duration: 0.6, ease: 'power2.inOut' })
          } else {
            tl.to(q('.preloader__content'), { autoAlpha: 0, y: -14, duration: 0.6, ease: 'power2.in' }, '+=0.15')
            // The hero starts as the curtain parts, so its first moves happen behind the opening.
            tl.add(() => {
              markRevealed()
              setScrollLocked(false)
            })
            tl.to(q('.preloader__half--top'), { yPercent: -100, duration: 1.4, ease: 'expo.inOut' }, '<0.1')
            tl.to(q('.preloader__half--bottom'), { yPercent: 100, duration: 1.4, ease: 'expo.inOut' }, '<')
          }
          tl.set(root.current, { display: 'none' })
        })
        loaded.then(() => live && open())
      })

      return () => {
        live = false
        stopListening()
        setScrollLocked(false)
      }
    },
    { scope: root },
  )

  return (
    <div ref={root} className="preloader" aria-hidden="true">
      <div className="preloader__half preloader__half--top" />
      <div className="preloader__half preloader__half--bottom" />
      <div className="preloader__content">
        <p className="preloader__arabic" lang="ar">
          {brand.arabic}
        </p>
        <p className="preloader__name">{brand.name}</p>
        <div className="preloader__meter">
          <span className="preloader__track">
            <span className="preloader__fill" />
          </span>
          <span className="preloader__count">00</span>
        </div>
      </div>
    </div>
  )
}
