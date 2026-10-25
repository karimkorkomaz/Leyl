import { gsap, ScrollTrigger, SplitText } from '../gsap'
import { sceneState } from '../sceneState'
import { sweepNow } from './sweep'

const EASE_3D = 'sine.inOut'

type Camera = { camZ: number; targetY: number }

/**
 * The Finale, scrubbed from the moment the section starts entering until its end (durations in
 * pixels of scroll). Entering: the bottle makes its last quarter turn home and the camera moves from
 * the Editions framing to the closing poster. Then "Wear the night." reveals letter by letter, and
 * when it completes, the light crosses the glass one last time.
 * `editions` is the Editions framing still in effect (its layer persists); the finale layer is a delta.
 */
export function finaleTimeline(
  root: HTMLElement,
  line: HTMLElement,
  pose: Camera & { turn: number },
  editions: Camera,
) {
  const enter = window.innerHeight
  const held = Math.max(root.offsetHeight - window.innerHeight, 1)
  const chars = SplitText.create(line, { type: 'words, chars', mask: 'chars' }).chars
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom bottom', scrub: 1 },
  })
  tl.to(
    sceneState.layers.finale,
    { rotY: pose.turn, camZ: pose.camZ - editions.camZ, targetY: pose.targetY - editions.targetY, duration: enter, ease: EASE_3D },
    0,
  )
  tl.from(chars, { yPercent: 115, duration: enter * 0.35, stagger: (enter * 0.55) / chars.length }, enter * 0.55)
  tl.set({}, {}, enter + held)

  ScrollTrigger.create({ trigger: root, start: () => `top+=${held * 0.35} top`, onEnter: sweepNow })
  return tl
}

/** Reduced motion: the line stands; the closing framing is a short, small move while in view. */
export function finaleStatic(root: HTMLElement, pose: Camera, editions: Camera) {
  ScrollTrigger.create({
    trigger: root,
    start: 'top center',
    end: 'bottom top',
    onToggle: (self) =>
      gsap.to(sceneState.layers.finale, {
        camZ: self.isActive ? pose.camZ - editions.camZ : 0,
        targetY: self.isActive ? pose.targetY - editions.targetY : 0,
        duration: 0.6,
        ease: 'power2.inOut',
        overwrite: true,
      }),
  })
}
