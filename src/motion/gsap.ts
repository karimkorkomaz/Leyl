// Register GSAP plugins once. Import gsap/ScrollTrigger/SplitText from here, not from 'gsap' directly.
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP)

// Mobile toolbars resize the viewport constantly; only refresh on real resizes.
ScrollTrigger.config({ ignoreMobileResize: true })

gsap.defaults({ ease: 'power3.out', duration: 1.1 })

export { gsap, ScrollTrigger, SplitText, useGSAP }
