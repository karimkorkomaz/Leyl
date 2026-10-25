import { useMemo } from 'react'
import { ink } from '../lib/cssVar'
import { radialTexture } from '../lib/radialTexture'

const GLOW_STOPS = [
  [0, 'rgba(255, 200, 135, 0.8)'],
  [0.18, 'rgba(240, 160, 90, 0.32)'],
  [0.45, 'rgba(200, 120, 60, 0.06)'],
  [1, 'rgba(200, 120, 60, 0)'],
] as const

/**
 * A soft warm glow behind the bottle: the studio's backlight. It lives in the scene (not the DOM)
 * so the glass refracts it. Opaque over ink so the mobile glass's transmission pass sees it too.
 * Becomes the edition aura later.
 */
export function Backdrop() {
  const glow = useMemo(() => radialTexture(GLOW_STOPS, { background: ink() }), [])

  return (
    <mesh position={[0, 2.1, -5]}>
      <planeGeometry args={[9, 9]} />
      <meshBasicMaterial map={glow} toneMapped={false} />
    </mesh>
  )
}
