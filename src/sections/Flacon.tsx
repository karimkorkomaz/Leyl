import type { CSSProperties } from 'react'

// Placeholder: section with a sticky 100svh stage; scroll length set by --len-flacon.
export function Flacon() {
  return (
    <section id="flacon" className="section" aria-label="The flacon" style={{ '--len': 'var(--len-flacon)' } as CSSProperties}>
      <div className="pin" />
    </section>
  )
}
