import { gsap, ScrollTrigger, SplitText } from '../gsap'
import { sceneState } from '../sceneState'

// The Notes, pinned and scrubbed over 100 units:
//  0–10   the atmosphere rises; the caption and Top arrive
// 28–40   Top gives way to Heart (atmosphere deepens)
// 60–72   Heart gives way to Base (deeper still)
// 88–100  everything leaves; the room returns to its rest look
// Two timelines share that range: the scene (built once) and the text (rebuilt per edition), so an
// edition change never re-scrubs the bottle.

const EASE_3D = 'sine.inOut'

const scrub = (root: HTMLElement) => ({ trigger: root, start: 'top top', end: 'bottom bottom', scrub: 1 })

export function notesScene(root: HTMLElement, pose: { turn: number; camZ: number; targetY: number }) {
  const layer = sceneState.layers.notes
  const look = sceneState.look
  const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: scrub(root) })
  tl.to(layer, { rotY: pose.turn, duration: 100, ease: EASE_3D }, 0)
  tl.to(layer, { camZ: pose.camZ, targetY: pose.targetY, duration: 10, ease: EASE_3D }, 0)
  tl.to(layer, { camZ: 0, targetY: 0, duration: 10, ease: EASE_3D }, 90)
  tl.fromTo(look, { notes: 0 }, { notes: 1, duration: 10, ease: EASE_3D }, 0)
  tl.fromTo(look, { stage: 0 }, { stage: 1, duration: 12, ease: EASE_3D }, 28)
  tl.to(look, { stage: 2, duration: 12, ease: EASE_3D }, 60)
  tl.to(look, { notes: 0, duration: 12, ease: EASE_3D }, 88)
  return tl
}

export type StepEls = { numeral: HTMLElement; word: HTMLElement; list: HTMLElement }

// The stage words are set at line-height 0.82, so glyph ink overhangs each character's box: a
// character moved only one box-height out of its mask leaves a descender peeking back in. Travel 150%.
const OUT = 150

/**
 * Splits and reveals the caption and the three stages. Call after fonts load.
 * `caption` is a one-line flex row inside an overflow-clip wrapper: it slides as one piece (SplitText
 * would rewrap its children into line boxes and lose the row's spacing).
 */
export function notesText(root: HTMLElement, caption: HTMLElement, steps: StepEls[]) {
  const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: scrub(root) })
  const split = steps.map((s) => ({
    ...s,
    chars: SplitText.create(s.word, { type: 'chars', mask: 'chars' }).chars,
    items: SplitText.create(s.list, { type: 'lines', mask: 'lines' }).lines,
  }))

  gsap.set(
    steps.map((s) => s.numeral),
    { autoAlpha: 0 },
  )
  tl.from(caption, { yPercent: 110, duration: 4 }, 0)

  const enter = (s: (typeof split)[number], at: number) => {
    tl.from(s.chars, { yPercent: OUT, duration: 4, stagger: 0.5 }, at)
    tl.fromTo(s.numeral, { autoAlpha: 0, yPercent: 12 }, { autoAlpha: 1, yPercent: 0, duration: 5 }, at)
    tl.from(s.items, { yPercent: 130, duration: 3, stagger: 0.7 }, at + 2.5)
  }
  const leave = (s: (typeof split)[number], at: number) => {
    tl.to(s.chars, { yPercent: -OUT, duration: 3.5, stagger: 0.35 }, at)
    tl.to(s.numeral, { autoAlpha: 0, yPercent: -12, duration: 4 }, at)
    tl.to(s.items, { yPercent: -130, duration: 3, stagger: 0.4 }, at)
  }

  enter(split[0], 2)
  leave(split[0], 28)
  enter(split[1], 33)
  leave(split[1], 60)
  enter(split[2], 65)
  leave(split[2], 90)
  tl.to(caption, { yPercent: -110, duration: 4 }, 92)
  tl.set({}, {}, 100) // pad to the full range so positions map 1:1 to scroll
  return tl
}

/**
 * Reduced motion: no pin. All three stages stand together; the room takes on the Heart's tone while
 * the section is in view (a short crossfade, not motion).
 */
export function notesStatic(root: HTMLElement) {
  const look = sceneState.look
  look.stage = 1
  ScrollTrigger.create({
    trigger: root,
    start: 'top center',
    end: 'bottom center',
    onToggle: (self) => gsap.to(look, { notes: self.isActive ? 1 : 0, duration: 0.8, ease: 'power2.inOut', overwrite: true }),
  })
}
