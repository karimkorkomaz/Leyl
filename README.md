# LEYL — Wear the night.

A concept site for **LEYL** (ليل, "night"), a fictional perfume house from Beirut: one scroll-driven,
real-time 3D story in a black studio where light is the main material.

Hero → The Flacon (the cap lifts, callouts draw themselves) → The Notes (Top, Heart, Base, with the
scent rising in the edition's color) → The Editions (Anbar, Ward, Dukhan) → Finale.

A concept by Ahmad El Amine.

## Stack

Vite, React 19, TypeScript · three.js with @react-three/fiber and drei · GSAP (ScrollTrigger,
SplitText) · Lenis.

## Commands

```bash
npm install
npm run dev       # dev server
npm run lint      # must pass
npm run build     # type-check + production build (must pass)
npm run preview   # serve the production build locally
```

## Deploy (Vercel)

`vercel.json` is ready (Vite preset, `dist`, long-lived caching for hashed assets).

- Dashboard: push the repo to GitHub, then "Add New → Project" in Vercel and import it. No settings to change.
- CLI: `npx vercel` (preview), then `npx vercel --prod`.

After the first deploy, set `og:url` and make `og:image` absolute in `index.html` with the production domain.

## How it works

- One fixed, opaque canvas behind the DOM. Anything that appears behind the bottle (the LEYL
  wordmark, the aura, the scent) lives in the 3D scene so the glass refracts it.
- GSAP timelines write plain numbers to a single scene state (`src/motion/sceneState.ts`) as
  additive per-section layers; one `useFrame` composes and applies them. No React state per frame.
- One atmosphere model (`src/motion/atmosphere.ts`) derives the aura, scent, liquid and floor light
  from the active edition, so switching edition re-tints the whole room.
- `CLAUDE.md` documents the architecture, art direction and the measured performance decisions;
  `BRIEF.md` holds the creative brief and the decisions made along the way.

## Credits

Perfume Bottle 3D model by [lamborado](https://sketchfab.com/3d-models/perfume-bottle-e263d9953f67444f8fa89530474126b4),
[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) (modified: materials replaced in code).
Typefaces: Cormorant Garamond, Manrope, Amiri (SIL Open Font License).
