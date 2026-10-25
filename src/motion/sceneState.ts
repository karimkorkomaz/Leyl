// The single mutable scene state. GSAP writes plain numbers here; SceneDriver's useFrame reads them.
// No React state is touched per frame.
//
// Final pose = base + Σ layers (+ idle float). Each section's timeline owns exactly one layer and
// writes deltas into it, so two scrubbed timelines never write the same value.
// No three.js import here: this module is in the entry chunk (App imports it), and three must stay in
// the lazily loaded 3D chunk.
import { defaultEdition, editions } from '../content'
import { heroPose } from './poses'

const defaultEditionColor = editions.find((e) => e.id === defaultEdition)!.color

/** A #rrggbb color as plain sRGB 0–1 numbers GSAP can tween (sRGB channels are just bytes / 255). */
export function srgb(hex: string) {
  const n = parseInt(hex.slice(1), 16)
  return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 }
}

export type Layer = {
  x: number
  y: number
  rotY: number
  capLift: number
  /** Cap lean in radians, clockwise on screen (applied about the view axis, not the cap's own). */
  capTilt: number
  camY: number
  camZ: number
  targetY: number
}

const layer = (): Layer => ({ x: 0, y: 0, rotY: 0, capLift: 0, capTilt: 0, camY: 0, camZ: 0, targetY: 0 })

export const sceneState = {
  base: { ...heroPose.desktop },
  layers: {
    /** The bottle's rise on load (time-driven, not scroll). */
    intro: layer(),
    flacon: layer(),
    notes: layer(),
    editions: layer(),
    finale: layer(),
  },
  idle: {
    /** 0–1 multiplier on the idle float (0 under reduced motion). */
    float: 1,
    /** 0–1 progress of the light strip across the glass; 0 and 1 are both "off". */
    sweep: 0,
    /** 0–1 multiplier on the drifting scent particles (0 under reduced motion). */
    scent: 1,
  },
  /** Color and atmosphere inputs. motion/atmosphere.ts turns these into aura/particle/liquid values. */
  look: {
    /** Active edition's liquid color, sRGB 0–1. Tweened when the edition changes. */
    edition: srgb(defaultEditionColor),
    /** 0–1: how much of The Notes' atmosphere shows (0 = the studio's rest look). */
    notes: 0,
    /** Continuous stage of The Notes: 0 Top, 1 Heart, 2 Base. */
    stage: 0,
    /** 0–1: the Editions section's own, fainter scent (its own input so it never fights `notes`). */
    editions: 0,
  },
  /** The giant in-scene LEYL behind the bottle. Defaults are the final, at-rest state. */
  wordmark: {
    /** 0–1 mask reveal (letters slide up into place). */
    reveal: 1,
    /** 0–1 progress of the hero scrolling away; the wordmark leaves with it. */
    scroll: 0,
  },
}

/** Flat list of layers, built once so the frame loop never allocates. */
export const layerList: readonly Layer[] = Object.values(sceneState.layers)
