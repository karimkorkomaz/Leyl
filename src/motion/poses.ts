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

/**
 * The Flacon's choreography endpoints, as deltas on top of the hero pose (see sceneState layers).
 * dolly: 0–40% (rotate 180°, camera closer). lift: 40–70% (cap up and leaning; the camera steps
 * back past rest and up, so base and lifted cap both stay framed with room for the callouts).
 * drift: 70–100% (cap home, bottle to the left, camera back to rest).
 */
export type FlaconPose = {
  dollyCamZ: number
  dollyTargetY: number
  capLift: number
  capTilt: number
  liftCamZ: number
  liftTargetY: number
  driftX: number
}

export const flaconPose: Record<'desktop' | 'mobile', FlaconPose> = {
  desktop: {
    dollyCamZ: -1.8,
    dollyTargetY: 0.3,
    capLift: 1.3,
    capTilt: deg(7),
    liftCamZ: 0.5,
    liftTargetY: 0.75,
    driftX: -0.22,
  },
  // Mobile keeps the bottle centered (CLAUDE.md): no drift, gentler camera.
  mobile: {
    dollyCamZ: -2,
    dollyTargetY: 0.3,
    capLift: 1.3,
    capTilt: deg(7),
    liftCamZ: 0.5,
    liftTargetY: 0.8,
    driftX: 0,
  },
}

/**
 * The Notes: the bottle (already drifted left by the Flacon on desktop) turns a slow quarter turn,
 * which a square bottle shows as returning to where it began. The camera steps back and looks a
 * little higher, so the scent has room to rise above the cap; on mobile, further, so the stage word
 * fits above the bottle and the notes below it.
 */
export const notesPose: Record<'desktop' | 'mobile', { turn: number; camZ: number; targetY: number }> = {
  desktop: { turn: Math.PI / 2, camZ: 1.2, targetY: 0.45 },
  mobile: { turn: Math.PI / 2, camZ: 3.2, targetY: 0.3 },
}

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
