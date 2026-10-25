// Loading and reveal, in two moments:
//  `loaded`   every asset the page performs with is in: fonts, the 3D chunk, the bottle, the
//             wordmark. Sections build their timelines (SplitText, ScrollTrigger) here, while the
//             preloader still covers the screen, so that work never shows.
//  `revealed` the preloader has begun to open. The hero intro and the nav start here.
// The preloader reports progress from the same parts (weighted), so its counter means something.

type Part = 'fonts' | 'stage' | 'bottle' | 'wordmark'

const WEIGHTS: Record<Part, number> = { fonts: 0.2, stage: 0.35, bottle: 0.3, wordmark: 0.15 }

const done = new Set<Part>()
const listeners = new Set<(progress: number) => void>()

let resolveLoaded: () => void = () => {}
let resolveRevealed: () => void = () => {}
export const loaded = new Promise<void>((resolve) => (resolveLoaded = resolve))
export const revealed = new Promise<void>((resolve) => (resolveRevealed = resolve))

export const getProgress = () => [...done].reduce((sum, part) => sum + WEIGHTS[part], 0)

/** Called once by each part when it is ready (repeat calls are ignored). */
export function markReady(part: Part) {
  if (done.has(part)) return
  done.add(part)
  const progress = getProgress()
  for (const fn of listeners) fn(progress)
  if (done.size === Object.keys(WEIGHTS).length) resolveLoaded()
}

export function onProgress(fn: (progress: number) => void) {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}

/** Called by the preloader as it opens. */
export const markRevealed = () => resolveRevealed()

Promise.all([
  document.fonts.load('300 1em "Cormorant Garamond"'),
  document.fonts.load('italic 300 1em "Cormorant Garamond"'),
  document.fonts.load('400 1em Manrope'),
  document.fonts.load('400 1em Amiri', 'ليل'),
]).then(() => markReady('fonts'))
