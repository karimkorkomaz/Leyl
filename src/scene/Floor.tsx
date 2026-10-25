import { useMemo } from 'react'
import { AdditiveBlending } from 'three'
import { ContactShadows } from '@react-three/drei'
import { radialTexture } from '../lib/radialTexture'

const POOL_STOPS = [
  [0, 'rgba(255, 214, 160, 0.8)'],
  [0.15, 'rgba(255, 205, 145, 0.35)'],
  [0.4, 'rgba(255, 196, 130, 0.1)'],
  [1, 'rgba(255, 196, 130, 0)'],
] as const

/**
 * A faint warm pool of light on the floor, so the contact shadow has something to darken and the
 * thick glass base has light to refract. Additive, not opaque: an opaque floor would hide the lower
 * half of the Backdrop and draw a hard horizon line.
 */
export function Floor() {
  const pool = useMemo(() => radialTexture(POOL_STOPS), [])

  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position-y={-0.001}>
        <planeGeometry args={[9, 9]} />
        <meshBasicMaterial map={pool} transparent depthWrite={false} blending={AdditiveBlending} toneMapped={false} />
      </mesh>
      <ContactShadows position-y={0.002} scale={7} blur={2.6} far={3} opacity={0.85} resolution={256} color="#000000" />
    </group>
  )
}
