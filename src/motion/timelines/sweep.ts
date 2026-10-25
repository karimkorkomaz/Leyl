import { gsap } from '../gsap'
import { sceneState } from '../sceneState'

let loop: gsap.core.Timeline | null = null

/** The light strip crosses the glass once, then again every ~8s. */
export function sweepTimeline({ delay = 0.6 } = {}) {
  loop = gsap
    .timeline({ delay, repeat: -1, repeatDelay: 6.6 })
    .fromTo(sceneState.idle, { sweep: 0 }, { sweep: 1, duration: 1.8, ease: 'power2.inOut' })
  return loop
}

/** Cross the glass right now (the Finale's last sweep); the ~8s rhythm continues from here. */
export function sweepNow() {
  if (!loop) return
  const s = sceneState.idle.sweep
  if (s > 0.02 && s < 0.98) return // one is already crossing: that is the last sweep
  loop.restart()
}
