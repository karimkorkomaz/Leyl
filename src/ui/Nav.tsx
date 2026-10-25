import { useRef } from 'react'
import { brand, nav } from '../content'
import { gsap, useGSAP } from '../motion/gsap'
import { MEDIA } from '../motion/media'
import { revealed } from '../motion/ready'
import './Nav.css'

export function Nav() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MEDIA.motionOK, (ctx) => {
        const items = gsap.utils.toArray<HTMLElement>('.nav__item')
        gsap.set(items, { autoAlpha: 0, y: -8 })
        // Joins the hero intro just after the tagline starts.
        const play = ctx.add('play', () =>
          gsap.to(items, { autoAlpha: 1, y: 0, duration: 1.1, stagger: 0.07, ease: 'power3.out', delay: 0.9 }),
        )
        let live = true
        revealed.then(() => live && play())
        return () => {
          live = false
        }
      })
    },
    { scope: root },
  )

  return (
    <header ref={root} className="nav">
      <a className="nav__item nav__logo" href="#hero" aria-label={`${brand.name}, back to top`}>
        <span className="nav__wordmark">{brand.name}</span>
        <span className="nav__arabic" lang="ar">
          {brand.arabic}
        </span>
      </a>
      <nav aria-label="Main">
        <ul className="nav__links">
          {nav.map((link) => (
            <li key={link.href} className="nav__item">
              <a className="nav__link" href={link.href}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
