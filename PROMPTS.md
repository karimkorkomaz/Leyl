# LEYL — Prompt sequence for Claude Code

Run these one at a time. Don't move to the next prompt until you're happy with the result.
Start each session inside the `perfume-site` folder. Press **Shift+Tab** to switch into plan mode where noted.

---

## 1. Plan (plan mode)
> Read CLAUDE.md and BRIEF.md carefully. Inspect the project and the model at public/models/perfume_bottle.glb.
> Propose an implementation plan: file structure, how scene state flows from GSAP to the 3D scene, how each
> section's timeline maps to that state, and anything in the brief you think is weak or risky. Don't write code yet.

Review the plan, push back on anything you don't like, then approve.

## 2. Foundation
> Build the foundation only: design tokens, fonts, global styles, Lenis synced with ScrollTrigger, the single fixed
> Canvas, the bottle loaded with the real materials and the Lightformer studio lighting from CLAUDE.md, and empty
> placeholder sections with the right heights. No scroll animations yet. The bottle should just float in the hero position.
> Screenshot it at 1440×900 and 390×844 with Playwright and tell me honestly whether the glass looks premium. Iterate
> on materials and lighting until it does.

This is the most important step. If the bottle doesn't look expensive standing still, no animation will save it.

## 3. Hero
> Build section 1 (Hero) from BRIEF.md: the giant LEYL behind the bottle, the light sweep, the tagline reveal, the
> scroll cue and the nav. Review with Playwright screenshots on desktop and mobile, then refine.

## 4. The Flacon
> Build section 2 (The Flacon): the pinned rotation, cap lift and callouts with self-drawing gold lines, following the
> scroll percentages in BRIEF.md. Use the cap's pivot as described in CLAUDE.md. Screenshot at 0%, 25%, 50%, 75% and 100%
> of the section on desktop and mobile, critique, and refine.

## 5. The Notes
> Build section 3 (The Notes) with the three stages, the atmosphere glow and the particles. Notes content comes from
> the active edition in content.ts. Review with screenshots at each stage and refine.

## 6. Editions
> Build section 4 (Editions): the edition switcher with the liquid color transition, Arabic name reveal and text swaps.
> It must be keyboard accessible. Review and refine.

## 7. Finale and footer
> Build section 5 (Finale) and the footer, including the exact 3D model credit from CLAUDE.md. Review and refine.

## 8. Preloader and polish
> Add the preloader, grain overlay, custom cursor and magnetic buttons from BRIEF.md. Keep them subtle.

## 9. Mobile and reduced motion pass
> Do a full pass at 390×844 and 768×1024: composition, text sizes, pin lengths, performance settings. Then test with
> prefers-reduced-motion enabled and make sure every section still reads well.

## 10. Jury review
> Act as a strict Awwwards jury member. Scroll the whole site with Playwright on desktop and mobile, screenshot each
> section, and score it on design, motion, creativity and performance. List the 10 most impactful improvements, ranked.
> Then implement the top 5.

Repeat step 10 once or twice. This is where it goes from good to stunning.

## 11. Ship
> Run lint and build, fix anything failing, and prepare the project for deployment on Vercel.

Then record a 60fps scroll-through for your reel.

---

## Tips while working
- **Be specific when giving feedback.** "The cap lifts too fast and the callouts feel cramped" beats "make it better."
- **Send it screenshots of sites you like** and ask what specifically makes them feel that way.
- **One thing at a time.** Big multi-part requests produce sloppier results.
- **Use `/clear` between sections** if the session gets long, and start with "Read CLAUDE.md and BRIEF.md, then…".
