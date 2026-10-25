import type { CSSProperties } from 'react'

// Placeholder: section with a sticky 100svh stage; scroll length set by --len-notes.
export function Notes() {
  return (
    <section id="notes" className="section" aria-label="The notes" style={{ '--len': 'var(--len-notes)' } as CSSProperties}>
      <div className="pin" />
    </section>
  )
}
