import type { CSSProperties } from 'react'

// Placeholder: section height set by --len-hero.
export function Hero() {
  return (
    <section id="hero" className="section" aria-label="Wear the night" style={{ '--len': 'var(--len-hero)' } as CSSProperties} />
  )
}
