import type { CSSProperties } from 'react'

// Placeholder: section height set by --len-editions.
export function Editions() {
  return (
    <section id="editions" className="section" aria-label="Editions" style={{ '--len': 'var(--len-editions)' } as CSSProperties} />
  )
}
