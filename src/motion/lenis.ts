import Lenis from 'lenis'
import { gsap, ScrollTrigger } from './gsap'

let lenis: Lenis | null = null

/** The live Lenis instance, or null under reduced motion. Use for scrollTo. */
export const getLenis = () => lenis

/** Start Lenis on GSAP's ticker so ScrollTrigger and Lenis share one clock. Returns a cleanup. */
export function startLenis() {
  const instance = new Lenis({ autoRaf: false, lerp: 0.1, smoothWheel: true, anchors: true })
  const raf = (time: number) => instance.raf(time * 1000)

  instance.on('scroll', ScrollTrigger.update)
  gsap.ticker.add(raf)
  gsap.ticker.lagSmoothing(0)
  lenis = instance

  return () => {
    gsap.ticker.remove(raf)
    gsap.ticker.lagSmoothing(500, 33)
    instance.destroy()
    if (lenis === instance) lenis = null
  }
}
