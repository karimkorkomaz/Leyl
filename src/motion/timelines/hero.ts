import { gsap, SplitText } from '../gsap'
import { introDrop } from '../poses'
import { sceneState } from '../sceneState'
import { sweepTimeline } from './sweep'

type HeroEls = {
  root: HTMLElement
  /** The tagline paragraph, one block-level span per line. */
  tagline: HTMLElement
  /** The scroll cue. */
  cue: HTMLElement
  /** Wrapper of tagline + cue; carries the scroll-out so it never fights the intro tweens. */
  foot: HTMLElement
}

/** Hide everything the intro will reveal. Call synchronously on mount (before first paint). */
export function heroIntroInitial({ tagline, cue }: HeroEls) {
  gsap.set(sceneState.layers.intro, { y: introDrop })
  gsap.set(sceneState.wordmark, { reveal: 0 })
  gsap.set([tagline, cue], { autoAlpha: 0 })
}

/**
 * The load sequence: the bottle rises, LEYL slides up behind it, the tagline reveals line by line,
 * the scroll cue settles in, and the first light sweep crosses the glass. Call once ready.
 */
export function heroIntro({ tagline, cue }: HeroEls) {
  const tl = gsap.timeline()
  tl.to(sceneState.layers.intro, { y: 0, duration: 2.4, ease: 'expo.out' }, 0)
  tl.to(sceneState.wordmark, { reveal: 1, duration: 1.8, ease: 'expo.out' }, 0.15)

  gsap.set(tagline, { autoAlpha: 1 })
  SplitText.create(tagline, {
    type: 'lines',
    mask: 'lines',
    linesClass: 'hero__split-line++',
    autoSplit: true,
    // Re-split on resize; returning the tween lets SplitText keep its progress in sync.
    onSplit: (self) =>
      gsap.from(self.lines, { yPercent: 105, duration: 1.3, stagger: 0.12, ease: 'expo.out', delay: 0.7 }),
  })

  tl.fromTo(cue, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 1.1, ease: 'power3.out' }, 1.3)

  // First crossing just after the reveal settles, then every ~8s.
  sweepTimeline({ delay: 1.1 })
  return tl
}

/**
 * As the hero scrolls away: the in-scene wordmark leaves with it (scrub: true, so it tracks the
 * page exactly like DOM would), and the tagline + cue fade a little faster than they scroll.
 */
export function heroScroll({ root, foot }: HeroEls, { fadeFoot }: { fadeFoot: boolean }) {
  gsap.to(sceneState.wordmark, {
    scroll: 1,
    ease: 'none',
    scrollTrigger: { trigger: root, start: 'top top', end: 'bottom top', scrub: true },
  })
  if (fadeFoot) {
    gsap.to(foot, {
      autoAlpha: 0,
      yPercent: -30,
      ease: 'none',
      scrollTrigger: { trigger: root, start: 'top top', end: '45% top', scrub: true },
    })
  }
}
