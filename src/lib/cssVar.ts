/** Read a design token from tokens.css, so the canvas and the DOM share one palette. */
export function cssVar(name: string, fallback: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback
}

export const ink = () => cssVar('--ink', '#0a0908')
