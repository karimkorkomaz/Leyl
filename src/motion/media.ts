// The three gsap.matchMedia() contexts from CLAUDE.md, shared by CSS-in-JS checks and timelines.
export const MEDIA = {
  desktop: '(min-width: 769px)',
  mobile: '(max-width: 768px)',
  reducedMotion: '(prefers-reduced-motion: reduce)',
  motionOK: '(prefers-reduced-motion: no-preference)',
} as const
