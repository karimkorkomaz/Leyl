// "Ready to perform": the moment the intro may start. Resolves once the 3D pieces have reported in
// and the fonts the intro sets are loaded. The preloader (later) will add "and has opened" to this.

type Part = 'bottle' | 'wordmark'

const pending = new Set<Part>(['bottle', 'wordmark'])
let resolveScene: () => void = () => {}
const scene = new Promise<void>((resolve) => {
  resolveScene = resolve
})

/** Called once by each 3D part when it is on screen. */
export function markReady(part: Part) {
  pending.delete(part)
  if (pending.size === 0) resolveScene()
}

export const introReady: Promise<void> = Promise.all([
  scene,
  document.fonts.load('300 1em "Cormorant Garamond"'),
  document.fonts.load('italic 300 1em "Cormorant Garamond"'),
  document.fonts.load('400 1em Manrope'),
  document.fonts.load('400 1em Amiri', 'ليل'),
]).then(() => undefined)
