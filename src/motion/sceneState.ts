// The single mutable scene state. GSAP writes plain numbers here; SceneDriver's useFrame reads them.
// No React state is touched per frame.
//
// Final pose = base + Σ layers (+ idle float). Each section's timeline owns exactly one layer and
// writes deltas into it, so two scrubbed timelines never write the same value.
import { heroPose } from './poses'

export type Layer = {
  x: number
  y: number
  rotY: number
  capLift: number
  capTilt: number
  camY: number
  camZ: number
}

const layer = (): Layer => ({ x: 0, y: 0, rotY: 0, capLift: 0, capTilt: 0, camY: 0, camZ: 0 })

export const sceneState = {
  base: { ...heroPose.desktop },
  layers: {
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
  },
}

/** Flat list of layers, built once so the frame loop never allocates. */
export const layerList: readonly Layer[] = Object.values(sceneState.layers)
