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
