import { useEffect, useRef, type CSSProperties } from 'react'
import { brand, editions, labels, stages, type EditionId } from '../content'
import { gsap, ScrollTrigger, SplitText, useGSAP } from '../motion/gsap'
import { getLenis } from '../motion/lenis'
import { MEDIA } from '../motion/media'
import { editionsPose } from '../motion/poses'
import { introReady } from '../motion/ready'
import { editionSwap, editionsScene, editionsStatic, type DetailEls } from '../motion/timelines/editions'
import { getEdition, setEdition, useEdition } from '../state/edition'
import { MagneticButton } from '../ui/MagneticButton'
import './Editions.css'

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()

// The three editions. All three detail blocks stay mounted and are split once; switching animates
// one out and the next in, so React never re-renders text that SplitText has restructured.
// The scene's colors follow the edition on their own (motion/editionLook.ts).
export function Editions() {
  const root = useRef<HTMLElement>(null)
  const active = useEdition()
  const swapTo = useRef<((id: EditionId) => void) | null>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      const conditions = { desktop: MEDIA.desktop, mobile: MEDIA.mobile, motionOK: MEDIA.motionOK, reduced: MEDIA.reducedMotion }
      mm.add(conditions, (ctx) => {
        const { mobile, reduced } = ctx.conditions as { mobile: boolean; reduced: boolean }
        const q = gsap.utils.selector(root)
        const blocks = q('.edition-detail') as HTMLElement[]
        gsap.set(blocks, { autoAlpha: 0 })
        gsap.set(q('.editions__reveal'), { autoAlpha: 0, y: reduced ? 0 : 16 })
        if (reduced) editionsStatic(root.current!)
        else editionsScene(root.current!, mobile ? editionsPose.mobile : editionsPose.desktop)

        const build = ctx.add('build', () => {
          const details = new Map<EditionId, DetailEls>()
          for (const block of blocks) {
            details.set(block.dataset.edition as EditionId, {
              block,
              arabic: SplitText.create(block.querySelector('.edition-detail__arabic'), { type: 'lines', mask: 'lines' }).lines,
              lines: SplitText.create(block.querySelectorAll('.edition-detail__split'), { type: 'lines', mask: 'lines' }).lines,
            })
          }

          let shown: EditionId | null = null
          let running: gsap.core.Timeline | null = null
          const show = (id: EditionId) => {
            if (id === shown) return
            running?.progress(1) // a quick second click finishes the first swap rather than tangling with it
            running = editionSwap(shown ? details.get(shown)! : null, details.get(id)!, { reduced })
            shown = id
          }

          // First reveal when the section arrives; later swaps follow the edition.
          ScrollTrigger.create({
            trigger: root.current,
            start: 'top 55%',
            once: true,
            onEnter: () => {
              show(getEdition())
              gsap.to(q('.editions__reveal'), { autoAlpha: 1, y: 0, duration: 1.1, stagger: 0.08, ease: 'power3.out', delay: 0.3 })
              swapTo.current = show
            },
          })
        })
        let live = true
        introReady.then(() => live && build())
        return () => {
          live = false
          swapTo.current = null
        }
      })
    },
    { scope: root },
  )

  useEffect(() => {
    swapTo.current?.(active)
  }, [active])

  const discover = () => {
    const finale = document.getElementById('finale')
    if (!finale) return
    const lenis = getLenis()
    if (lenis) lenis.scrollTo(finale)
    else finale.scrollIntoView()
  }

  return (
    <section ref={root} id="editions" className="section editions" aria-labelledby="editions-title">
      <div className="pin editions__stage">
        <h2 id="editions-title" className="editions__caption editions__reveal">
          {labels.editions}
        </h2>

        <div className="editions__details">
          {editions.map((e) => (
            <div key={e.id} className="edition-detail" data-edition={e.id} aria-hidden={e.id !== active}>
              <p className="edition-detail__arabic" lang="ar">
                {e.arabic}
              </p>
              <p className="edition-detail__line edition-detail__split">{e.line}</p>
              <p className="edition-detail__mood edition-detail__split">{e.mood}</p>
              <dl className="edition-detail__notes">
                {stages.map((s) => (
                  <div key={s.id} className="edition-detail__row edition-detail__split">
                    <dt>{s.label}</dt>
                    <dd>{e.notes[s.id].map((n, i) => (i ? n.toLowerCase() : capitalize(n))).join(', ')}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>

        <div className="editions__buy editions__reveal">
          <p className="editions__price">{brand.price}</p>
          <p className="editions__format">{labels.format}</p>
          <MagneticButton onClick={discover}>{labels.discover}</MagneticButton>
        </div>

        <div className="editions__picker editions__reveal" role="group" aria-label={labels.chooseEdition}>
          {editions.map((e) => (
            <button
              key={e.id}
              type="button"
              className="edition-option"
              aria-pressed={e.id === active}
              onClick={() => setEdition(e.id)}
              style={{ '--swatch': e.color } as CSSProperties}
            >
              <span className="edition-option__swatch" aria-hidden="true" />
              <span className="edition-option__name">{e.name}</span>
              <span className="edition-option__arabic" lang="ar">
                {e.arabic}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
