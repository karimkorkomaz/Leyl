import { useRef } from 'react'
import { callouts, type CalloutId } from '../content'
import { gsap, ScrollTrigger, useGSAP } from '../motion/gsap'
import { MEDIA } from '../motion/media'
import { flaconPose } from '../motion/poses'
import { loaded } from '../motion/ready'
import { emptyDraw, flaconStatic, flaconTimeline, type CalloutEls } from '../motion/timelines/flacon'
import { onAnchors, screenAnchors } from '../scene/anchors'
import './Flacon.css'

/** Desktop: which side of the bottle each callout sits on. Mobile: above or below the bottle. */
const LAYOUT: Record<CalloutId, { side: 'left' | 'right'; slot: 'top' | 'bottom' }> = {
  base: { side: 'left', slot: 'bottom' },
  volume: { side: 'left', slot: 'bottom' },
  cap: { side: 'right', slot: 'top' },
}

/** Space between a hairline's end and its text, px. */
const GAP = 16

/** Mobile: callouts keep at least this far from the screen edges, px. */
const EDGE = 20
/** Mobile: the hairline first steps this far outward from its dot, then turns vertical, px.
 *  A line dropped straight from a dot on the glass edge would lie on the edge's own highlight. */
const STUB = 18
/** Share of a mobile line's draw spent on the outward stub. */
const STUB_SHARE = 0.25

const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1)

type Mode = 'side' | 'slot' | 'list'
type Metrics = { edgeX: number; titleCenter: number; slotEdgeY: number; width: number }

export function Flacon() {
  const root = useRef<HTMLElement>(null)
  const stage = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const stageEl = stage.current!
      const q = gsap.utils.selector(root)
      const els: (CalloutEls & { line: HTMLElement; stub: HTMLElement; dot: HTMLElement })[] = callouts.map((c) => {
        const [item] = q(`[data-callout="${c.id}"]`) as HTMLElement[]
        return {
          id: c.id,
          item,
          title: item.querySelector<HTMLElement>('.callout__title')!,
          body: item.querySelector<HTMLElement>('.callout__body')!,
          line: q(`[data-line="${c.id}"]`)[0] as HTMLElement,
          stub: q(`[data-stub="${c.id}"]`)[0] as HTMLElement,
          dot: q(`[data-dot="${c.id}"]`)[0] as HTMLElement,
        }
      })

      let mode: Mode = 'side'
      let active = false
      let draw = emptyDraw()
      const metrics: Partial<Record<CalloutId, Metrics>> = {}

      // Static geometry, measured on refresh rather than per frame.
      const measure = () => {
        const s = stageEl.getBoundingClientRect()
        for (const c of els) {
          const r = c.item.getBoundingClientRect()
          const { side, slot } = LAYOUT[c.id]
          metrics[c.id] = {
            edgeX: side === 'left' ? r.right - s.left + GAP : r.left - s.left - GAP,
            titleCenter: c.title.offsetTop + c.title.offsetHeight / 2,
            slotEdgeY: slot === 'bottom' ? r.top - s.top - GAP : r.bottom - s.top + GAP,
            width: r.width,
          }
        }
      }

      // Every frame, after the scene projects the anchors: place dots, draw lines, level the text.
      const write = () => {
        if (!active || mode === 'list') return
        const top = stageEl.getBoundingClientRect().top
        for (const c of els) {
          const m = metrics[c.id]
          if (!m) continue
          const ax = screenAnchors[c.id].x
          const ay = screenAnchors[c.id].y - top
          const d = draw[c.id]
          c.dot.style.transform = `translate3d(${ax}px, ${ay}px, 0) scale(${d.dot})`
          if (mode === 'side') {
            c.item.style.transform = `translate3d(0, ${ay - m.titleCenter}px, 0)`
            const length = Math.abs(m.edgeX - ax) * d.line
            const x0 = LAYOUT[c.id].side === 'left' ? ax - length : ax
            c.line.style.transform = `translate3d(${x0}px, ${ay - 0.5}px, 0) scale(${length}, 1)`
          } else {
            // An elbow: a short stub outward from the dot, then vertical to the text.
            const dir = LAYOUT[c.id].side === 'left' ? -1 : 1
            const stub = STUB * clamp01(d.line / STUB_SHARE)
            c.stub.style.transform = `translate3d(${dir < 0 ? ax - stub : ax}px, ${ay - 0.5}px, 0) scale(${stub}, 1)`
            const lx = ax + dir * STUB
            const length = Math.abs(m.slotEdgeY - ay) * clamp01((d.line - STUB_SHARE) / (1 - STUB_SHARE))
            const y0 = LAYOUT[c.id].slot === 'bottom' ? ay : ay - length
            c.line.style.transform = `translate3d(${lx - 0.5}px, ${y0}px, 0) scale(1, ${length})`
            // The text hangs from its line like a flag: starts at it (left side) or ends at it (right),
            // kept inside the screen margins.
            const ideal = dir < 0 ? lx - 2 : lx + 2 - m.width
            const x = Math.min(Math.max(ideal, EDGE), stageEl.clientWidth - EDGE - m.width)
            c.item.style.transform = `translate3d(${x}px, 0, 0)`
          }
        }
      }

      ScrollTrigger.create({
        trigger: root.current,
        start: 'top bottom',
        end: 'bottom top',
        onToggle: (self) => (active = self.isActive),
      })
      ScrollTrigger.addEventListener('refresh', measure)
      const stopWriting = onAnchors(write)

      const mm = gsap.matchMedia()
      // Include both sides of each query: matchMedia only runs the callback when one condition matches.
      const conditions = { desktop: MEDIA.desktop, mobile: MEDIA.mobile, motionOK: MEDIA.motionOK, reduced: MEDIA.reducedMotion }
      mm.add(conditions, (ctx) => {
        const { mobile, reduced } = ctx.conditions as { mobile: boolean; reduced: boolean }
        mode = mobile && reduced ? 'list' : mobile ? 'slot' : 'side'
        root.current!.dataset.layout = mode
        draw = emptyDraw()
        for (const c of els) {
          c.item.style.transform = ''
          c.stub.style.transform = 'scale(0)'
        }
        gsap.set(
          els.map((c) => c.item),
          { autoAlpha: 0 },
        )

        const pose = mobile ? flaconPose.mobile : flaconPose.desktop
        // Built once fonts are in, so SplitText measures real lines and the text has its final size.
        const build = ctx.add('build', () => {
          measure()
          if (reduced) flaconStatic(root.current!, els, draw, pose)
          else flaconTimeline(root.current!, els, draw, pose, { stacked: !mobile })
        })
        let live = true
        loaded.then(() => live && build())
        return () => {
          live = false
        }
      })

      return () => {
        stopWriting()
        ScrollTrigger.removeEventListener('refresh', measure)
      }
    },
    { scope: root },
  )

  return (
    <section ref={root} id="flacon" className="section flacon" aria-labelledby="flacon-title">
      <h2 id="flacon-title" className="sr-only">
        The flacon
      </h2>
      <div ref={stage} className="pin flacon__stage">
        <ul className="flacon__callouts">
          {callouts.map((c) => (
            <li
              key={c.id}
              className="callout"
              data-callout={c.id}
              data-side={LAYOUT[c.id].side}
              data-slot={LAYOUT[c.id].slot}
            >
              <span className="callout__title">{c.title}</span> <span className="callout__body">{c.body}</span>
            </li>
          ))}
        </ul>
        {callouts.map((c) => (
          <span key={c.id} className="callout__line" data-line={c.id} aria-hidden="true" />
        ))}
        {callouts.map((c) => (
          <span key={c.id} className="callout__line" data-stub={c.id} aria-hidden="true" />
        ))}
        {callouts.map((c) => (
          <span key={c.id} className="callout__dot" data-dot={c.id} aria-hidden="true" />
        ))}
      </div>
    </section>
  )
}
