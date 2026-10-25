import { useRef } from 'react'
import { labels, stages } from '../content'
import { gsap, useGSAP } from '../motion/gsap'
import { MEDIA } from '../motion/media'
import { notesPose } from '../motion/poses'
import { introReady } from '../motion/ready'
import { notesScene, notesStatic, notesText } from '../motion/timelines/notes'
import { getEditionData, useEdition } from '../state/edition'
import './Notes.css'

// Top, Heart, Base for the active edition. The bottle (left on desktop) turns slowly while the
// aura and the scent shift from light to deep (motion/atmosphere.ts); this DOM carries the words.
export function Notes() {
  const root = useRef<HTMLElement>(null)
  const column = useRef<HTMLDivElement>(null)
  const editionId = useEdition()
  const edition = getEditionData(editionId)

  // The scene: built once, independent of the edition.
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      const conditions = { desktop: MEDIA.desktop, mobile: MEDIA.mobile, motionOK: MEDIA.motionOK, reduced: MEDIA.reducedMotion }
      mm.add(conditions, (ctx) => {
        const { mobile, reduced } = ctx.conditions as { mobile: boolean; reduced: boolean }
        root.current!.dataset.layout = reduced ? 'list' : 'stage'
        if (reduced) notesStatic(root.current!)
        else notesScene(root.current!, mobile ? notesPose.mobile : notesPose.desktop)
      })
    },
    { scope: root },
  )

  // The words: rebuilt when the edition changes (the keyed column below is fresh DOM each time).
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MEDIA.motionOK, (ctx) => {
        const q = gsap.utils.selector(column)
        const caption = q('.notes__caption')[0] as HTMLElement
        const steps = (q('.notes__step') as HTMLElement[]).map((step) => ({
          numeral: step.querySelector<HTMLElement>('.notes__numeral')!,
          word: step.querySelector<HTMLElement>('.notes__word')!,
          list: step.querySelector<HTMLElement>('.notes__list')!,
        }))
        gsap.set(column.current, { autoAlpha: 0 })
        const build = ctx.add('build', () => {
          gsap.set(column.current, { autoAlpha: 1 })
          notesText(root.current!, caption, steps)
        })
        let live = true
        introReady.then(() => live && build())
        return () => {
          live = false
        }
      })
    },
    { scope: root, dependencies: [editionId], revertOnUpdate: true },
  )

  return (
    <section ref={root} id="notes" className="section notes" aria-labelledby="notes-title">
      <h2 id="notes-title" className="sr-only">
        The notes of {edition.name}
      </h2>
      <div className="pin notes__stage">
        <div ref={column} key={edition.id} className="notes__column">
          <div className="notes__caption-mask">
            <p className="notes__caption" aria-hidden="true">
              <span className="notes__label">{labels.notes}</span>
              <span className="notes__edition">{edition.name}</span>
              <span className="notes__arabic" lang="ar">
                {edition.arabic}
              </span>
            </p>
          </div>
          <ol className="notes__steps">
            {stages.map((stage) => (
              <li key={stage.id} className="notes__step">
                <span className="notes__numeral" aria-hidden="true">
                  {stage.numeral}
                </span>
                <h3 className="notes__word">{stage.label}</h3>
                <ul className="notes__list">
                  {edition.notes[stage.id].map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
