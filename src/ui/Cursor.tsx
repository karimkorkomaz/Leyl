import { useRef } from 'react'
import { gsap, useGSAP } from '../motion/gsap'
import './Cursor.css'

const INTERACTIVE = 'a, button, [data-cursor]'

/**
 * A small dot at the pointer and a ring that follows with a little weight, growing over anything
 * interactive. Only for a real hovering pointer with motion allowed; otherwise the native cursor.
 */
export function Cursor() {
  const root = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
        const q = gsap.utils.selector(root)
        const dot = q('.cursor__dot')[0]
        const ring = q('.cursor__ring')[0]
        const dotX = gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power3.out' })
        const dotY = gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power3.out' })
        const ringX = gsap.quickTo(ring, 'x', { duration: 0.55, ease: 'power3.out' })
        const ringY = gsap.quickTo(ring, 'y', { duration: 0.55, ease: 'power3.out' })
        document.documentElement.classList.add('has-custom-cursor')

        let shown = false
        const move = (e: PointerEvent) => {
          if (e.pointerType !== 'mouse') return
          if (!shown) {
            shown = true
            gsap.set([dot, ring], { x: e.clientX, y: e.clientY })
            gsap.to(root.current, { autoAlpha: 1, duration: 0.3 })
          }
          dotX(e.clientX)
          dotY(e.clientY)
          ringX(e.clientX)
          ringY(e.clientY)
        }
        const over = (e: PointerEvent) => {
          const hot = (e.target as Element | null)?.closest?.(INTERACTIVE)
          root.current!.classList.toggle('is-hot', Boolean(hot))
        }
        const leave = () => {
          shown = false
          gsap.to(root.current, { autoAlpha: 0, duration: 0.3 })
        }
        window.addEventListener('pointermove', move, { passive: true })
        document.addEventListener('pointerover', over, { passive: true })
        document.documentElement.addEventListener('pointerleave', leave)
        return () => {
          window.removeEventListener('pointermove', move)
          document.removeEventListener('pointerover', over)
          document.documentElement.removeEventListener('pointerleave', leave)
          document.documentElement.classList.remove('has-custom-cursor')
        }
      })
    },
    { scope: root },
  )

  return (
    <div ref={root} className="cursor" aria-hidden="true">
      {/* The outer ring is moved by GSAP; the inner one scales (transform-only, no layout). */}
      <span className="cursor__ring">
        <span className="cursor__ring-inner" />
      </span>
      <span className="cursor__dot" />
    </div>
  )
}
