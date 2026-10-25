import type { CSSProperties } from 'react'

// Placeholder: section height set by --len-finale.
export function Finale() {
  return (
    <section id="finale" className="section" aria-label="Finale" style={{ '--len': 'var(--len-finale)' } as CSSProperties} />
  )
}
