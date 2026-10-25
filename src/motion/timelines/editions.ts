import { gsap, ScrollTrigger } from '../gsap'
import { sceneState } from '../sceneState'

const EASE_3D = 'sine.inOut'

/**
 * One scrubbed timeline over the section's whole pass (entering, the short hold, leaving), so the
 * Editions scent has a single owner. Durations are in pixels of scroll.
 *  enter: the bottle comes back to center, the camera steps back and lower, the scent rises.
 *  leave: only the scent fades. The pose stays: the Finale builds on it.
 */
export function editionsScene(root: HTMLElement, content: HTMLElement, pose: { x: number; camZ: number; targetY: number }) {
  const enter = window.innerHeight
  const hold = Math.max(root.offsetHeight - window.innerHeight, 1)
  const leave = window.innerHeight
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom top', scrub: 1 },
  })
  tl.to(sceneState.layers.editions, { x: pose.x, camZ: pose.camZ, targetY: pose.targetY, duration: enter, ease: EASE_3D }, 0)
  tl.fromTo(sceneState.look, { editions: 0 }, { editions: 1, duration: enter, ease: EASE_3D }, 0)
  tl.to(sceneState.look, { editions: 0, duration: leave, ease: EASE_3D }, enter + hold)
  // The words clear early in the leave, so they never slide across the bottle as it moves on.
  tl.to(content, { autoAlpha: 0, y: -40, duration: leave * 0.35 }, enter + hold)
  return tl
}

/**
 * Reduced motion: no pose change (the Flacon's drift never happened, so there is nothing to undo);
 * the edition-colored scent crossfades in while the section is in view.
 */
export function editionsStatic(root: HTMLElement) {
  ScrollTrigger.create({
    trigger: root,
    start: 'top center',
    end: 'bottom center',
    onToggle: (self) =>
      gsap.to(sceneState.look, { editions: self.isActive ? 1 : 0, duration: 0.8, ease: 'power2.inOut', overwrite: true }),
  })
}

export type DetailEls = {
  block: HTMLElement
  /** The Arabic name, masked as one line: Arabic is cursive, so it is never split into characters. */
  arabic: Element[]
  /** Mood, line and notes summary, split into masked lines. */
  lines: Element[]
}

/**
 * Swap the edition details: the outgoing lines leave upward through their masks, the incoming ones
 * rise in (BRIEF: the Arabic name reveals with a mask; mood and notes swap with a SplitText transition).
 * `from` is null for the first reveal. Reduced motion: a plain crossfade.
 */
export function editionSwap(from: DetailEls | null, to: DetailEls, { reduced }: { reduced: boolean }) {
  const tl = gsap.timeline()
  if (reduced) {
    if (from) tl.to(from.block, { autoAlpha: 0, duration: 0.35, ease: 'power2.inOut' })
    tl.fromTo(to.block, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5, ease: 'power2.inOut' }, from ? 0.25 : 0)
    return tl
  }
  if (from) {
    tl.to(from.arabic, { yPercent: -110, duration: 0.55, ease: 'power2.in' }, 0)
    tl.to(from.lines, { yPercent: -110, duration: 0.5, stagger: 0.035, ease: 'power2.in' }, 0)
    tl.set(from.block, { autoAlpha: 0 })
  }
  tl.set(to.block, { autoAlpha: 1 })
  tl.fromTo(to.arabic, { yPercent: 110 }, { yPercent: 0, duration: 1.3, ease: 'expo.out' })
  tl.fromTo(to.lines, { yPercent: 110 }, { yPercent: 0, duration: 1.1, stagger: 0.06, ease: 'expo.out' }, '<0.12')
  return tl
}
