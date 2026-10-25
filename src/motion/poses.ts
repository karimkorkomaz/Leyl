// Every numeric endpoint for the 3D choreography, per breakpoint.
// x is a fraction of the visible width at the bottle (so layouts hold across aspect ratios);
// y, cam*, target* are world units. The bottle is 3.67 units tall with its base at y = 0.

export type BasePose = {
  x: number
  y: number
  rotY: number
  scale: number
  camY: number
  camZ: number
  targetY: number
}

const deg = (d: number) => (d * Math.PI) / 180

export const heroPose: Record<'desktop' | 'mobile', BasePose> = {
  desktop: { x: 0, y: 0.18, rotY: deg(-30), scale: 1, camY: 2.5, camZ: 13.5, targetY: 2.15 },
  mobile: { x: 0, y: 0.18, rotY: deg(-30), scale: 1, camY: 2.6, camZ: 18, targetY: 2.3 },
}

/** Idle float: amplitude in world units, period in seconds. */
export const float = { amplitude: 0.05, period: 6 }

/** The bottle starts this far below its rest pose and rises into place on load. */
export const introDrop = -0.35

export type WordmarkPose = {
  /** Vertical center of the letters (world units). */
  y: number
  /** Depth: behind the bottle (which spans z ±1), in front of the Backdrop (z -5). */
  z: number
  /** Word width as a fraction of the visible width at its depth. Above 1 crops off both edges. */
  widthFraction: number
  /** How far the word travels per hero scrolled, in visible heights. Below 1 reads as deeper. */
  parallax: number
}

export const wordmarkPose: Record<'desktop' | 'mobile', WordmarkPose> = {
  // Across the bottle's shoulders: the cap rises in front of the letters, E and Y sit behind the glass.
  desktop: { y: 2.35, z: -2.2, widthFraction: 0.84, parallax: 0.85 },
  // On a portrait screen the bottle fills most of the width and would hide the word entirely, so
  // the word sits above it, cropped at both edges, with the cap rising into its lower half.
  mobile: { y: 4.45, z: -2.2, widthFraction: 1.22, parallax: 0.85 },
}
