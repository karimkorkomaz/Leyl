// 3D → DOM bridge for the Flacon callouts. The frame driver projects these points to viewport
// pixels every frame and notifies subscribers, which write transforms straight to the DOM.
import type { CalloutId } from '../content'

/**
 * Anchor points in the bottle's non-rotating frame (the "lift" group: origin at the base center,
 * floats with the bottle, does not spin). Placed on the silhouette as it stands after the Flacon's
 * 180° turn (150°, which a square bottle shows the same as its -30° rest angle): its corners sit at
 * x ±1.37. The cap's anchor is relative to the cap's base and rides the lift.
 */
export const anchorPoints: Record<CalloutId, { x: number; y: number; z: number; onCap?: true }> = {
  // The corners are rounded, so the visible edge sits ~0.12 inside the mathematical corner.
  base: { x: -1.24, y: 0.34, z: 0.37 },
  volume: { x: -1.24, y: 1.75, z: 0.37 },
  cap: { x: 0.56, y: 0.7, z: 0, onCap: true },
}

export const anchorIds = Object.keys(anchorPoints) as CalloutId[]

/** Latest projected positions, in viewport CSS pixels. */
export const screenAnchors: Record<CalloutId, { x: number; y: number }> = {
  base: { x: 0, y: 0 },
  volume: { x: 0, y: 0 },
  cap: { x: 0, y: 0 },
}

type Listener = () => void
const listeners = new Set<Listener>()

/** Run `fn` after every frame's projection. Returns an unsubscribe function. */
export function onAnchors(fn: Listener) {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}

export function emitAnchors() {
  for (const fn of listeners) fn()
}
