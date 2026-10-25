import { gsap } from '../gsap'
import { sceneState } from '../sceneState'

/** The light strip crosses the glass once, then again every ~8s. */
export function sweepTimeline({ delay = 0.6 } = {}) {
  return gsap
    .timeline({ delay, repeat: -1, repeatDelay: 6.6 })
    .fromTo(sceneState.idle, { sweep: 0 }, { sweep: 1, duration: 1.8, ease: 'power2.inOut' })
}
