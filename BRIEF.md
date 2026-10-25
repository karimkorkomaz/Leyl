# LEYL — Creative Brief

## The concept
**LEYL** (ليل, "night") is a fictional perfume house from Beirut.
Its fragrances are built around the city at night: warm stone after sunset, roses on balconies, incense drifting from old streets.

- Tagline: **Wear the night.**
- Product: LEYL Eau de Parfum, 50 ml, in three editions
- Price (fictional): $185
- Tone of voice: quiet confidence. Short sentences. Sensory, never salesy. No exclamation marks.

This is a concept site for a portfolio. It must feel like a real luxury launch.

## The editions
| Edition | Arabic | Liquid color | Mood | Top | Heart | Base |
|---|---|---|---|---|---|---|
| **Anbar** | عنبر | `#C8782A` amber | Warm, golden, slow | Bergamot, saffron | Labdanum, honey | Amber, vanilla, cedar |
| **Ward** | ورد | `#8E2A3E` deep rose | Romantic, velvet | Pink pepper, lychee | Damask rose | Oud, white musk |
| **Dukhan** | دخان | `#3E5A78` smoky blue | Cool, mysterious | Cardamom, black pepper | Frankincense, iris | Vetiver, smoked cedar |

Default edition on load: **Anbar**.

## Visual direction
Dark luxury. A black studio where light is the main material: thin light streaks sliding across glass,
liquid glowing softly, gold used like jewelry (small, precise). Huge serif typography with lots of empty space.

References: before building, pick 3 sites from Awwwards or Godly (search "perfume", "luxury product", "WebGL product")
and paste their links here. Claude should study what makes them feel expensive and borrow principles, not copy layouts.
- Reference 1:https://www.awwwards.com/sites/be-the-drop (site is offline; dropped)
- Reference 2:https://www.awwwards.com/sites/the-watch
- Reference 3:https://dribbble.com/shots/27699419-Elora-Luxury-Perfume-Website-UI-Design

Principles borrowed (not layouts):
- The Watch: wordmark lives *in* the 3D scene; on mobile it stays huge and crops off both edges instead of shrinking.
  Product at a ~30° three-quarter angle, never square-on. Copy is tiny and rare. Faint 1px structural lines
  (axis, ring) the product sits on. Particles form shaped ribbons/trails, never random dust.
  Avoid: its extreme page length and low-contrast grey text.
- Elora: type woven in depth with the bottle; Latin + Arabic pairing; faint column lines; callouts on hairlines
  that follow the bottle silhouette, ending in a small dot. Avoid: saturated color, photo collage, e-commerce chrome.

## Decisions (agreed 2026-10-25)
- Hero "LEYL" is rendered in the 3D scene behind the bottle (refracted by the glass), not DOM text. Canvas is opaque.
- A small persistent edition control ("Edition — Anbar", bottom-left, real buttons) lets the visitor switch edition
  anywhere, so The Notes reflects their choice. Section 4 stays the full Editions moment.
- The Flacon: the pump collar is brushed gold (revealed when the cap lifts); cap lift ~1.4 units. Callout hairlines
  follow the bottle outline and end in a small gold dot.
- The cap carries a hairline brushed-gold band at its base (added in Foundation: the only gold visible at rest).
- The thick glass base glows from inside with a paler tint of the edition color ("a base that holds the light").
- Hero: on mobile the wordmark sits above the bottle (cropped at both edges, the cap rising into it); behind the
  bottle at mid-height it was almost fully hidden on a portrait screen. Desktop keeps it across the shoulders.
- Hero: tagline set bottom-left in two lines ("Wear the / night.", second line indented), scroll cue
  bottom-right, keeping the bottle's axis clear. (Alternative if preferred: centered under the bottle.)

Proposed defaults (not yet confirmed; revisit after screenshots):
- The Notes: "scent" particles rise in trails from the bottle.
- Bottle rest angle ~−30° so two glass faces catch the strip lights; all rotations are relative to it.
- Editions: bottle returns to center, slightly lowered, edition names in a row beneath it.
- Floor: a faint warm light pool under the bottle with the contact shadow inside it.

## Scroll narrative (build in this order)

### 0. Preloader
Black screen. "ليل" in Amiri and "LEYL" in Cormorant, with a thin gold progress line and a small percentage counter.
When loading completes, the preloader splits open (two halves slide apart or a mask wipes up) to reveal the hero.

### 1. Hero — "Wear the night." (100vh)
- The bottle stands centered in darkness, slightly below the middle, floating gently.
- A single thin light strip sweeps across the glass from left to right on load, then repeats slowly every ~8s.
- Giant "LEYL" in Cormorant sits **behind** the bottle (DOM text under the transparent canvas), very large and low-contrast.
- Tagline "Wear the night." reveals line by line below. Small "Scroll" cue with a thin animated line at the bottom.
- Top nav: logo on the left; "Editions", "The Notes", "Discover" on the right (small uppercase Manrope).

### 2. The Flacon (pinned, ~300vh desktop)
- 0–40%: The bottle rotates 180° slowly while the camera eases closer.
- 40–70%: The cap lifts ~1.2 units and tilts slightly, then hovers, revealing the pump.
- Three callouts appear one at a time, each connected to its part by a thin gold line that draws itself:
  - "Cast glass. A 9 mm base that holds the light."
  - "Hand-polished cap. Weighted, cool to the touch."
  - "50 ml. Eau de Parfum."
- 70–100%: The cap settles back, the bottle drifts left to make room for the next section.

### 3. The Notes (pinned, ~300vh desktop)
- Three stages: **Top**, **Heart**, **Base**, for the active edition.
- Each stage: a huge serif word for the stage name, the notes listed small beneath it, and a large, faint numeral (01, 02, 03).
- The atmosphere shifts per stage: a soft radial glow behind the bottle and drifting particles ("scent") change tone
  from light/bright (top) to deep (base). The bottle slowly turns.

### 4. Editions
- The three editions side by side as names (Latin + Arabic), with the active one highlighted.
- Clicking an edition: the liquid color transitions smoothly (~1.2s), the Arabic name reveals with a mask,
  the notes summary and mood line swap with a SplitText transition. The glow/particles adopt the edition color.
- Price and a "Discover" button (magnetic hover). The button does nothing real.
- Keyboard accessible: editions are real buttons.

### 5. Finale
- Huge "Wear the night." across the screen; letters reveal on scroll.
- The bottle returns to center, cap closed, in a final hero pose with a last light sweep.
- Footer: LEYL wordmark, "A concept by Ahmad El Amine", the 3D model credit (see CLAUDE.md), and the year.

## Polish layer (after all sections work)
- Film-grain overlay (very subtle, CSS or a tiny shader)
- Custom cursor: a small ring that grows over interactive elements
- Magnetic buttons
- Section transitions where the next headline enters as the previous exits
- Optional later: ambient sound toggle

## Out of scope
Real checkout, CMS, multiple pages, a backend.

## Done means
- All sections built and reviewed with screenshots on desktop and mobile
- Smooth at 60fps, lint and build passing
- Deployed (Vercel or Netlify)
- A 60fps screen recording of the full scroll, for Instagram and the portfolio
