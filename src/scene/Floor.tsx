import { useMemo, useRef } from 'react'
import { AdditiveBlending, SRGBColorSpace, type MeshBasicMaterial } from 'three'
import { ContactShadows } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { atmosphere } from '../motion/atmosphere'
import { radialTexture } from '../lib/radialTexture'

// A neutral falloff; the color comes from the atmosphere (it follows the edition).
const POOL_STOPS = [
  [0, 'rgba(255, 255, 255, 0.8)'],
  [0.15, 'rgba(255, 255, 255, 0.35)'],
  [0.4, 'rgba(255, 255, 255, 0.1)'],
  [1, 'rgba(255, 255, 255, 0)'],
] as const

/**
 * A faint pool of light on the floor, so the contact shadow has something to darken and the
 * thick glass base has light to refract. Additive, not opaque: an opaque floor would hide the lower
 * half of the Backdrop and draw a hard horizon line.
 */
export function Floor() {
  const pool = useMemo(() => radialTexture(POOL_STOPS), [])
  const material = useRef<MeshBasicMaterial>(null)

  useFrame(() => {
    const { r, g, b } = atmosphere.pool
    material.current?.color.setRGB(r, g, b, SRGBColorSpace)
  })

  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position-y={-0.001}>
        <planeGeometry args={[9, 9]} />
        <meshBasicMaterial
          ref={material}
          map={pool}
          transparent
          depthWrite={false}
          blending={AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
      <ContactShadows position-y={0.002} scale={7} blur={2.6} far={3} opacity={0.85} resolution={256} color="#000000" />
    </group>
  )
}
