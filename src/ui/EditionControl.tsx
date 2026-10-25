import { useRef, type CSSProperties } from 'react'
import { editions, labels } from '../content'
import { ScrollTrigger, useGSAP } from '../motion/gsap'
import { getEditionData, setEdition, useEdition } from '../state/edition'
import './EditionControl.css'

/**
 * A small fixed switch, bottom-left, shown while The Notes is on screen: The Notes describes the
 * active edition but comes before the Editions section, so the visitor can change it right there.
 */
export function EditionControl() {
  const root = useRef<HTMLDivElement>(null)
  const active = useEdition()

  useGSAP(() => {
    ScrollTrigger.create({
      trigger: '#notes',
      start: 'top 35%',
      end: 'bottom 65%',
      toggleClass: { targets: root.current!, className: 'is-visible' },
    })
  })

  return (
    <div ref={root} className="edition-control" role="group" aria-label={labels.chooseEdition}>
      <span className="edition-control__label">{labels.edition}</span>
      <span className="edition-control__dots">
        {editions.map((e) => (
          <button
            key={e.id}
            type="button"
            className="edition-control__dot"
            aria-label={e.name}
            aria-pressed={e.id === active}
            onClick={() => setEdition(e.id)}
            style={{ '--swatch': e.color } as CSSProperties}
          />
        ))}
      </span>
      <span className="edition-control__name" aria-hidden="true">
        {getEditionData(active).name}
      </span>
    </div>
  )
}
