# LEYL — Perfume Concept Site

A single-page, scroll-driven 3D showcase for **LEYL**, a fictional perfume house from Beirut.
This is a portfolio piece: it must look like premium agency work (Awwwards-level), run at 60fps,
and work on phones. Read `BRIEF.md` for the brand, copy, and section-by-section choreography.

## Stack
- Vite + React + TypeScript
- three, @react-three/fiber, @react-three/drei (3D)
- gsap + ScrollTrigger + SplitText, @gsap/react (`useGSAP`) — all GSAP plugins are free
- lenis (smooth scroll)
- Ask before adding any other dependency, and say why. `@react-three/postprocessing` is pre-approved if used for subtle bloom/vignette only.

## Commands
- `npm run dev` — dev server
- `npm run build` — must pass with zero TypeScript errors before any task is called done
- `npm run lint` — must pass

## The 3D model: `public/models/perfume_bottle.glb`
Load with `useGLTF('/models/perfume_bottle.glb')` (meshopt-compressed; drei decodes it automatically).
Call `useGLTF.preload` at module level.

Node tree (Y-up, base of bottle at y=0, centered on X/Z, total height ~3.67 units with cap):
```
PerfumeBottle
├── glass        transparent glass body (square, thick base)
├── liquid       the perfume inside — recolor per edition
├── pump
│   ├── collar       black gloss pump collar
│   ├── nozzle       spray actuator, faces -X
│   ├── nozzle_hole
│   ├── spring
│   └── dip_tube     clear tube inside the glass
└── cap          node origin = cap CENTER (position.y = 3.050); cap's bottom edge sits at y = 2.427
```
- Mesh quantization baked each node's origin to its bbox center, so the cap's pivot is NOT at its base.
  Read the cap's rest position on load and animate an offset from it (never hard-code 2.427 as `position.y`).
  For a tilt hinged at the base, reparent the cap at runtime into a pivot group at y = 2.427. Never move its geometry.
- Clearance: collar top is y = 3.525, so lift ≥ ~1.4 (cap bottom at 3.83) before tilting, or the cap clips the collar.
- The materials in the file are placeholders. **Replace them in code** (see Materials).
- Rotate the whole bottle around Y via the `PerfumeBottle` group; it spins in place.
- **License: CC BY 4.0.** The footer must include: "Perfume Bottle 3D model by lamborado, CC BY 4.0" linking to
  https://sketchfab.com/3d-models/perfume-bottle-e263d9953f67444f8fa89530474126b4 and the license URL.

## Architecture
- ONE fixed, full-screen `<Canvas>` behind all DOM content (`position: fixed; inset: 0; z-index: 0`), **opaque**, cleared to `--ink`. DOM sections scroll over it. Never create a second canvas.
  Anything that appears *behind* the bottle (hero LEYL wordmark, aura glow, particles) lives in the 3D scene so the glass
  refracts it; DOM is only for what sits in front. (Transmission can't see DOM, so DOM-behind-glass looks like a cut-out.)
- Section timelines write **additive layers** in scene state (`base + Σ layers`), one layer per section, so two scrubbed
  timelines never write the same value (avoids snaps when `scrub` catch-up tweens overlap at section boundaries).
- The active edition is React state in `src/state/edition.ts` (`useEdition`, `setEdition`). It is mirrored into
  `sceneState.look.edition` (sRGB, crossfaded by `motion/editionLook.ts`). GSAP writes only scalars to `sceneState.look`
  (`notes` 0–1, `stage` 0–2); `motion/atmosphere.ts` turns those into aura, scent, liquid, base-glow and floor-pool
  colors once per frame. Never tween colors in individual components.
- A section whose text depends on the edition uses two timelines over the same scroll range: the scene (built once)
  and the text (rebuilt per edition, keyed DOM), so an edition change never re-scrubs the bottle (see The Notes).
- A single mutable scene-state object (e.g. `src/motion/sceneState.ts`) holds animated values: bottle rotation/position/scale, cap lift, camera position/target, light sweep, liquid color, aura color.
- GSAP timelines (with ScrollTrigger) write to that object. `useFrame` reads it and applies it to the scene. **No React state updates per frame.**
- Lenis drives scrolling and is synced to ScrollTrigger:
  `lenis.on('scroll', ScrollTrigger.update); gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);`
- All GSAP code inside `useGSAP(() => {...}, { scope })` so it cleans up. Call `ScrollTrigger.refresh()` after the model and fonts load.
- Use `gsap.matchMedia()` with three contexts: desktop `(min-width: 769px)`, mobile `(max-width: 768px)`, and `(prefers-reduced-motion: reduce)`.
- Keep all copy in `src/content.ts` (brand, editions, notes, callouts) so text can change without touching components.

Suggested structure:
```
src/
  content.ts
  styles/tokens.css, global.css
  motion/sceneState.ts, lenis.ts, timelines/*.ts
  scene/Experience.tsx, Bottle.tsx, Lighting.tsx, Particles.tsx
  sections/Hero.tsx, Flacon.tsx, Notes.tsx, Editions.tsx, Finale.tsx, Footer.tsx
  ui/Preloader.tsx, Cursor.tsx, Grain.tsx, MagneticButton.tsx
```

## Art direction — dark luxury
Palette (CSS custom properties in `tokens.css`):
- `--ink: #0A0908` (page background, warm near-black)
- `--ink-2: #14110F` (raised surfaces)
- `--ivory: #EDE6DA` (primary text)
- `--stone: #8A8378` (secondary text)
- `--gold: #C9A96E` (accents, hairlines, highlights — use sparingly)
- Editions: `--anbar: #C8782A`, `--ward: #8E2A3E`, `--dukhan: #3E5A78`

Typography (Google Fonts):
- Display: **Cormorant Garamond** (300/400, italics allowed). Very large, tight tracking on headlines.
- Body/UI: **Manrope** (400/500). Small, generous letter-spacing for labels (uppercase, 0.2em).
- Arabic accents: **Amiri** for the Arabic edition names (عنبر، ورد، دخان) and ليل.
- Never use Inter, Roboto, Arial, or system-default stacks for visible text.

Layout: generous negative space, a 12-column grid, thin 1px gold hairlines as dividers, asymmetric compositions.
The bottle is the hero. Text never competes with it. One idea per section.

## Materials and lighting
Implemented in `src/scene/materials.tsx`, `Lighting.tsx`, `ReflectionOverlay.tsx`. Tuned against screenshots; measured on an Intel HD 530.
- `glass`: `MeshTransmissionMaterial` on desktop — thickness 0.7, roughness 0.04, ior 1.5, chromaticAberration 0.015,
  anisotropicBlur 0, samples 6, resolution 512, **no `backside`** (−11 fps). Mobile: `MeshPhysicalMaterial` transmission 1.
- `liquid`: **opaque**, black base color, edition-colored emissive shaped in its shader (bright face centers, darker
  corners) to fake a backlight. Real transmission on the liquid costs ~28 fps; three's transmission also ignores
  non-opaque objects, so the mobile glass would show an empty bottle.
- `cap`: black lacquer, clearcoat 1. A hairline brushed-gold band at its base; the collar under it is brushed gold.
- Tone mapping: `NeutralToneMapping` (keeps edition hues; AgX turned the amber pastel). The canvas clears alpha to 0
  for offscreen passes (ContactShadows breaks on an opaque clear otherwise).
- Lighting: a **static** `<Environment frames={1}>` of `<Lightformer>` strips. Each face's broad softbox sits on that
  face's mirror direction at the −30° rest angle; thin strips catch corners; warm rims outline the silhouette.
- The light sweep is **not** an animated Lightformer: a live environment drops to 23 fps. `ReflectionOverlay` redraws
  glass and cap additively and evaluates a near vertical strip analytically per pixel (so it slides across flat faces),
  plus the thick base's inner glow. Driven by `sceneState.idle.sweep` (`motion/timelines/sweep.ts`). Overlays render
  on-screen only (excluded from MTM's refraction buffer) and use polygonOffset to avoid z-fighting the glass.
- Behind the bottle: an opaque warm `Backdrop` glow (opaque so the mobile glass refracts it); on the floor an additive
  light pool plus `<ContactShadows>`. Glow textures have no mipmaps (they caused a hard edge at grazing angles).
- Hero wordmark: drei `<Text>` (troika) in the scene, additive, low contrast. troika's build rejects woff2, so it
  uses `public/fonts/cormorant-garamond-light-wordmark.ttf`, a 2 KB subset (L, E, Y) from the Google Fonts API.
- Optional, subtle bloom only. Note: a postprocessing composer renders the main pass offscreen; revisit
  `ReflectionOverlay`'s on-screen check if one is added.

## Motion rules
- Motion has weight. Easing: `expo.out` / `power3.out` for reveals, `power2.inOut` for transitions, `none` inside scrubbed timelines.
- No bounce, elastic, or back easing. Nothing spins fast.
- Reveal durations 0.9–1.4s. Character staggers 0.02–0.05s. Scroll scrub: `scrub: 1`.
  Exception: things that must track the page exactly like DOM (the hero wordmark leaving) use `scrub: true`.
- Inside scrubbed timelines, DOM tweens use `ease: 'none'`; 3D camera/bottle segments use `sine.inOut` so the
  camera never jerks where one segment hands over to the next.
- `gsap.matchMedia().add({ a, b }, fn)` only runs `fn` when at least one condition matches: always pass both
  sides of each query (e.g. `desktop` + `mobile`, `motionOK` + `reduced`), or the default case silently never builds.
- Text reveals use SplitText with masks (lines or chars sliding up inside `overflow: hidden`), never plain fades only.
- Animate only `transform` and `opacity` in the DOM.
- Camera moves are slow and purposeful. The bottle's idle state has a slow float (~0.05 units, 6s cycle).
- Mobile: same story, simpler moves, shorter pins (≤200vh), bottle centered, `dpr={[1, 1.5]}`.
- Reduced motion: no Lenis, no scrubbing, no idle float; sections show their final states with simple fades.

## Performance budget
- 60fps on a mid-range laptop; no long tasks during scroll.
- `dpr={[1, 1.75]}` desktop. Pause rendering when the tab is hidden.
- Hero visible in under 2.5s on a fast connection; preloader covers model/font loading.
- Particles: instanced or a single `Points` object, ≤ 800 points.
- The 3D stage is a lazy chunk (`App.tsx`); the GLB is preloaded in `index.html`. Keep the entry chunk lean:
  modules the entry imports (`motion/`, `state/`, `sections/`, `ui/`, `content.ts`) must never import `three`, or all of
  three.js moves into the first download (check the build output: entry ≈ 128 KB gzip, Stage ≈ 335 KB).
- **Measure frame cost, not rAF rate.** When the Playwright browser window is covered by another window, Chrome
  throttles any page that renders to ~1 fps, which looks like a regression but isn't. Benchmark with
  `__leyl.three.set({ frameloop: 'never' })`, then time `__leyl.three.advance(t)` + `gl.getContext().finish()`
  per frame, **paced** with a ~14 ms gap between frames (a flat-out loop thermally throttles the iGPU and
  reports 3–7× worse numbers). Baseline (Hero, 1424×900, HD 530): ~2–3.5 ms median, p95 < 9 ms.
- For intro screenshots, pause `__leyl.gsap.globalTimeline` *before* the intro starts, then step it with
  `.time(T + t)`; completed tweens are removed from the global timeline, so seeking backwards doesn't work.

## Working rules (how to work on this project)
1. Build one section at a time, in the order in `BRIEF.md`. Do not start the next section until the current one is reviewed.
2. After each change to visuals: run the dev server, then use the **Playwright MCP** to screenshot at 1440×900 and 390×844, at several scroll positions inside the section. Look at the screenshots and critique them against `BRIEF.md` and these rules. Fix what's weak before reporting back.
   In dev, `window.__leyl` exposes `gsap`, `sceneState` and the R3F state (`three`) — see `src/lib/dev.ts`. Pause
   time and pose the scene for deterministic screenshots: `__leyl.gsap.globalTimeline.pause()`, then set
   `sceneState` values (e.g. `idle.sweep`, `idle.float = 0`). Meshes are named (`glass`, `liquid`, `cap`, …) for
   live toggling. Save screenshots under `.playwright-mcp/` (git-ignored).
3. Before saying a task is done: `npm run lint` and `npm run build` must pass.
4. Use the GSAP skills for GSAP code and the frontend-design skill for layout and typography decisions.
5. When unsure about a creative choice, propose 2 options briefly rather than guessing.
