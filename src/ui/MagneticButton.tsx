import { useRef, type ReactNode } from 'react'
import { gsap, useGSAP } from '../motion/gsap'
import './MagneticButton.css'

type MagneticButtonProps = {
  children: ReactNode
  onClick?: () => void
  className?: string
}

/** Pulls toward the pointer while hovered (the label a little further), settles back on leave. */
export function MagneticButton({ children, onClick, className = '' }: MagneticButtonProps) {
  const button = useRef<HTMLButtonElement>(null)

  useGSAP(
    () => {
      const el = button.current!
      const label = el.querySelector('.magnetic__label')!
      const mm = gsap.matchMedia()
      // Only for a real hovering pointer, and never under reduced motion.
      mm.add('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
        const settle = { duration: 0.7, ease: 'power3.out' }
        const x = gsap.quickTo(el, 'x', settle)
        const y = gsap.quickTo(el, 'y', settle)
        const lx = gsap.quickTo(label, 'x', settle)
        const ly = gsap.quickTo(label, 'y', settle)
        const move = (e: PointerEvent) => {
          const r = el.getBoundingClientRect()
          const dx = e.clientX - (r.left + r.width / 2)
          const dy = e.clientY - (r.top + r.height / 2)
          x(dx * 0.28)
          y(dy * 0.35)
          lx(dx * 0.12)
          ly(dy * 0.14)
        }
        const leave = () => {
          x(0)
          y(0)
          lx(0)
          ly(0)
        }
        el.addEventListener('pointermove', move)
        el.addEventListener('pointerleave', leave)
        return () => {
          el.removeEventListener('pointermove', move)
          el.removeEventListener('pointerleave', leave)
        }
      })
    },
    { scope: button },
  )

  return (
    <button ref={button} type="button" className={`magnetic ${className}`} onClick={onClick} data-cursor="grow">
      <span className="magnetic__label">{children}</span>
    </button>
  )
}
