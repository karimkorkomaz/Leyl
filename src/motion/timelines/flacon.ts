import type { CalloutId } from '../../content'
import { gsap, ScrollTrigger, SplitText } from '../gsap'
import type { FlaconPose } from '../poses'
import { sceneState } from '../sceneState'

export type CalloutEls = { id: CalloutId; item: HTMLElement; title: HTMLElement; body: HTMLElement }

/** Per-callout draw progress (0–1), read every frame by the DOM writer in Flacon.tsx. */
export type CalloutDraw = Record<CalloutId, { dot: number; line: number }>

export const emptyDraw = (): CalloutDraw => ({
  base: { dot: 0, line: 0 },
  cap: { dot: 0, line: 0 },
  volume: { dot: 0, line: 0 },
})

// Gentle in-out on 3D moves so the camera never jerks where one segment hands over to the next;
// DOM tweens stay linear inside the scrub.
const EASE_3D = 'sine.inOut'

/**
 * The pinned Flacon timeline, 100 units long, scrubbed across the section.
 *  0–40  the bottle turns 180°, the camera eases closer
 * 40–70  the cap lifts and leans, then hovers; the camera eases back and up to keep it framed;
 *        the three callouts arrive one at a time (dot, then line, then text)
 * 70–100 callouts leave, the cap settles home, the bottle drifts left for The Notes
 *
 * `stacked`: desktop keeps earlier callouts on screen as later ones arrive; mobile shows one at a time.
 */
export function flaconTimeline(
  root: HTMLElement,
  callouts: CalloutEls[],
  draw: CalloutDraw,
  pose: FlaconPose,
  { stacked, intro }: { stacked: boolean; intro: HTMLElement[] },
) {
  const layer = sceneState.layers.flacon

  // The headline rises while the section scrolls in (as the hero's tagline fades: one headline
  // enters as the other exits), then leaves inside the pinned timeline before the cap lifts.
  // Built first, so a reload mid-section sees its end state before the exit tween records from it.
  const introLines = SplitText.create(intro, { type: 'lines', mask: 'lines' }).lines
  gsap.from(introLines, {
    yPercent: 110,
    stagger: 0.15,
    ease: 'none',
    scrollTrigger: { trigger: root, start: 'top 75%', end: 'top 10%', scrub: 1 },
  })

  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: root, start: 'top top', end: 'bottom bottom', scrub: 1 },
  })

  tl.to(layer, { rotY: Math.PI, camZ: pose.dollyCamZ, targetY: pose.dollyTargetY, duration: 40, ease: EASE_3D }, 0)
  tl.to(layer, { camZ: pose.liftCamZ, targetY: pose.liftTargetY, duration: 14, ease: EASE_3D }, 40)
  tl.to(layer, { capLift: pose.capLift, duration: 12, ease: EASE_3D }, 40)
  tl.to(layer, { capTilt: pose.capTilt, duration: 8, ease: EASE_3D }, 47)
  // Hover: the cap keeps rising, barely, while the callouts read.
  tl.to(layer, { capLift: pose.capLift + 0.07, duration: 16, ease: EASE_3D }, 54)
  // -150, not -110: at line-height 0.95 a descender (the g of "night") overhangs its mask and would
  // peek back in after a one-box exit.
  tl.to(introLines, { yPercent: -150, duration: 5, stagger: 0.8 }, 30)

  // Desktop callouts stay once drawn. Mobile shows one at a time, and its pin is shorter (200vh, so
  // one unit is ~1vh of scroll): each gets a ~10-unit window with a quicker draw so it can be read.
  const starts: Record<CalloutId, number> = stacked
    ? { base: 43, cap: 51, volume: 59 }
    : { base: 40, cap: 51, volume: 62 }
  const beat = stacked
    ? { line: 0.8, lineDur: 4, text: 2.6, textDur: 3, stagger: 0.8 }
    : { line: 0.4, lineDur: 2.5, text: 1.4, textDur: 2.2, stagger: 0.5 }

  for (const c of callouts) {
    const at = starts[c.id]
    const split = SplitText.create([c.title, c.body], { type: 'lines', mask: 'lines' })
    tl.fromTo(c.item, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01 }, at)
    tl.to(draw[c.id], { dot: 1, duration: 1.2 }, at)
    tl.to(draw[c.id], { line: 1, duration: beat.lineDur }, at + beat.line)
    tl.from(split.lines, { yPercent: 105, duration: beat.textDur, stagger: beat.stagger }, at + beat.text)
    if (!stacked) {
      tl.to(c.item, { autoAlpha: 0, duration: 1.2 }, at + 8.8)
      tl.to(draw[c.id], { dot: 0, line: 0, duration: 1.2 }, at + 8.8)
    }
  }

  if (stacked) {
    tl.to(
      callouts.map((c) => c.item),
      { autoAlpha: 0, duration: 3 },
      70,
    )
    tl.to(Object.values(draw), { dot: 0, line: 0, duration: 4 }, 70)
  }

  tl.to(layer, { capLift: 0, capTilt: 0, duration: 10, ease: EASE_3D }, 70)
  tl.to(layer, { x: pose.driftX, camZ: 0, targetY: 0, duration: 25, ease: EASE_3D }, 75)
  return tl
}

/**
 * Reduced motion: no pin, no turn. All callouts stand drawn; the cap lifts briefly (a short,
 * small move) while the section is in view, so the pump they describe is visible.
 */
export function flaconStatic(root: HTMLElement, callouts: CalloutEls[], draw: CalloutDraw, pose: FlaconPose) {
  gsap.set(
    callouts.map((c) => c.item),
    { autoAlpha: 1 },
  )
  for (const d of Object.values(draw)) Object.assign(d, { dot: 1, line: 1 })
  const layer = sceneState.layers.flacon
  ScrollTrigger.create({
    trigger: root,
    start: 'top center',
    end: 'bottom center',
    onToggle: (self) =>
      gsap.to(layer, { capLift: self.isActive ? pose.capLift : 0, duration: 0.6, ease: 'power2.inOut', overwrite: true }),
  })
}
