// The atmosphere model: turns a few tweenable inputs (sceneState.look) into everything the scene's
// mood is made of: the aura behind the bottle, the scent particles, the liquid and base-glow colors.
// Computed once per frame by the scene driver; all colors here are sRGB 0–1 (converted where used).
//
// The Notes moves through three stages, from light and bright (Top) to deep (Base). Every preset is
// derived from the active edition's color, so switching edition re-tints the whole room.

type RGB = { r: number; g: number; b: number }

type Look = {
  auraCore: RGB
  auraOuter: RGB
  /** Peak intensity of the glow. */
  auraStrength: number
  /** Size multiplier of the glow (1 = the hero's). */
  auraRadius: number
  particleColor: RGB
  particleOpacity: number
  /** Multiplier on how fast the scent rises. */
  particleSpeed: number
  /** Multiplier on particle size. */
  particleSize: number
  /** Multiplier on how high the trails climb. */
  particleRise: number
}

const rgb = (): RGB => ({ r: 0, g: 0, b: 0 })
const look = (): Look => ({
  auraCore: rgb(),
  auraOuter: rgb(),
  auraStrength: 0,
  auraRadius: 0,
  particleColor: rgb(),
  particleOpacity: 0,
  particleSpeed: 0,
  particleSize: 0,
  particleRise: 0,
})

/** The frame's result. Read by Backdrop, Particles, the liquid and the base glow. */
export const atmosphere = {
  ...look(),
  /** Liquid emissive color. */
  liquid: rgb(),
  /** The thick base's inner glow: paler than the liquid, light carried into clear glass. */
  baseGlow: rgb(),
  /** The light pool on the floor (the base refracts it, so it must follow the edition too). */
  pool: rgb(),
}

const LIGHT: RGB = { r: 1, g: 0.95, b: 0.88 }
const INK: RGB = { r: 0.039, g: 0.035, b: 0.031 }
const BASE_GLOW_TINT: RGB = { r: 1, g: 0.902, b: 0.769 }

function mix(out: RGB, a: RGB, b: RGB, t: number) {
  out.r = a.r + (b.r - a.r) * t
  out.g = a.g + (b.g - a.g) * t
  out.b = a.b + (b.b - a.b) * t
  return out
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t

function mixLook(out: Look, a: Look, b: Look, t: number) {
  mix(out.auraCore, a.auraCore, b.auraCore, t)
  mix(out.auraOuter, a.auraOuter, b.auraOuter, t)
  mix(out.particleColor, a.particleColor, b.particleColor, t)
  out.auraStrength = lerp(a.auraStrength, b.auraStrength, t)
  out.auraRadius = lerp(a.auraRadius, b.auraRadius, t)
  out.particleOpacity = lerp(a.particleOpacity, b.particleOpacity, t)
  out.particleSpeed = lerp(a.particleSpeed, b.particleSpeed, t)
  out.particleSize = lerp(a.particleSize, b.particleSize, t)
  out.particleRise = lerp(a.particleRise, b.particleRise, t)
  return out
}

function setScalars(l: Look, strength: number, radius: number, opacity: number, speed: number, size: number, rise: number) {
  l.auraStrength = strength
  l.auraRadius = radius
  l.particleOpacity = opacity
  l.particleSpeed = speed
  l.particleSize = size
  l.particleRise = rise
}

// Presets, rebuilt in place each frame from the edition color (no allocation per frame).
const rest = look()
const top = look()
const heart = look()
const base = look()
const notesLook = look()

function buildPresets(ed: RGB) {
  // The studio at rest: a warm glow, no scent.
  mix(rest.auraCore, ed, LIGHT, 0.55)
  mix(rest.auraOuter, ed, ed, 0)
  mix(rest.particleColor, ed, LIGHT, 0.6)
  setScalars(rest, 1, 1, 0, 1, 1, 1)

  // Top: airy, bright, quick.
  mix(top.auraCore, ed, LIGHT, 0.7)
  mix(top.auraOuter, ed, LIGHT, 0.3)
  mix(top.particleColor, ed, LIGHT, 0.7)
  setScalars(top, 1.05, 1.2, 0.9, 1.3, 0.8, 1.2)

  // Heart: the edition itself, full and warm.
  mix(heart.auraCore, ed, LIGHT, 0.35)
  mix(heart.auraOuter, ed, ed, 0)
  mix(heart.particleColor, ed, LIGHT, 0.35)
  setScalars(heart, 1, 1, 0.85, 0.9, 1, 1)

  // Base: deep, low, slow; the scent dims and settles rather than glittering.
  mix(base.auraCore, ed, INK, 0.2)
  mix(base.auraOuter, ed, INK, 0.55)
  mix(base.particleColor, ed, INK, 0.35)
  setScalars(base, 0.9, 0.82, 0.45, 0.5, 1.15, 0.7)
}

export function updateAtmosphere(input: { edition: RGB; notes: number; stage: number }) {
  const ed = input.edition
  buildPresets(ed)
  const s = Math.min(Math.max(input.stage, 0), 2)
  if (s <= 1) mixLook(notesLook, top, heart, s)
  else mixLook(notesLook, heart, base, s - 1)
  mixLook(atmosphere, rest, notesLook, Math.min(Math.max(input.notes, 0), 1))

  mix(atmosphere.liquid, ed, ed, 0)
  mix(atmosphere.baseGlow, ed, BASE_GLOW_TINT, 0.4)
  mix(atmosphere.pool, ed, LIGHT, 0.65)
}
