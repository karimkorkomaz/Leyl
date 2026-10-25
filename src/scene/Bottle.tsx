import { useEffect, useMemo, type Ref } from 'react'
import { Box3, Color, type Group, type Mesh } from 'three'
import { useGLTF } from '@react-three/drei'
import type { GLTF } from 'three-stdlib'
import { defaultEdition, editions } from '../content'
import { ScrollTrigger } from '../motion/gsap'
import { markReady } from '../motion/ready'
import { GlassMaterial, LiquidMaterial } from './materials'
import { ReflectionOverlay } from './ReflectionOverlay'

const MODEL_URL = '/models/perfume_bottle.glb'

type BottleGLTF = GLTF & {
  nodes: Record<'glass' | 'liquid' | 'collar' | 'nozzle' | 'nozzle_hole' | 'spring' | 'dip_tube' | 'cap', Mesh>
}

type BottleProps = {
  /** Cheaper physical glass instead of MeshTransmissionMaterial. */
  lite: boolean
  /** Pivot group at the cap's base edge; SceneDriver lifts and tilts it. */
  capPivotRef: Ref<Group>
}

const liquidColor = editions.find((e) => e.id === defaultEdition)!.color
// The thick base glows paler than the liquid: light carried down into clear glass, not more perfume.
const baseGlowColor = `#${new Color(liquidColor).lerp(new Color('#ffe6c4'), 0.4).getHexString()}`

const CAP_BAND_HEIGHT = 0.045

/** Widest horizontal radius among the mesh's lowest vertices (local units × node scale). */
function bottomRadius(mesh: Mesh) {
  const position = mesh.geometry.getAttribute('position')
  let minY = Infinity
  for (let i = 0; i < position.count; i++) minY = Math.min(minY, position.getY(i))
  let radius = 0
  for (let i = 0; i < position.count; i++) {
    if (position.getY(i) - minY < 0.04) radius = Math.max(radius, Math.hypot(position.getX(i), position.getZ(i)))
  }
  return radius * mesh.scale.x
}

export function Bottle({ lite, capPivotRef }: BottleProps) {
  const { nodes } = useGLTF(MODEL_URL) as unknown as BottleGLTF
  const { glass, liquid, collar, nozzle, nozzle_hole, spring, dip_tube, cap } = nodes

  // Quantization put the cap's origin at its center; hinge it at its base edge instead.
  const capBaseY = useMemo(() => new Box3().setFromObject(cap).min.y, [cap])
  const capBandRadius = useMemo(() => bottomRadius(cap), [cap])
  // Where the liquid ends, in the glass's local y: below it is the thick glass base.
  const baseTop = useMemo(
    () => (new Box3().setFromObject(liquid).min.y - glass.position.y) / glass.scale.y,
    [liquid, glass],
  )

  // Section heights don't depend on the model, but its arrival can shift layout timing.
  useEffect(() => {
    ScrollTrigger.refresh()
    markReady('bottle')
  }, [])

  return (
    <group dispose={null}>
      <mesh name="glass" geometry={glass.geometry} position={glass.position} scale={glass.scale}>
        <GlassMaterial lite={lite} />
      </mesh>
      <ReflectionOverlay
        geometry={glass.geometry}
        position={glass.position}
        scale={glass.scale}
        f0={0.04}
        intensity={22}
        // The mobile camera sits farther back, which widens the strip's reflection on flat faces.
        width={lite ? 0.065 : 0.1}
        baseGlow={{ color: baseGlowColor, strength: 0.55, baseTop }}
      />

      <mesh name="liquid" geometry={liquid.geometry} position={liquid.position} scale={liquid.scale}>
        <LiquidMaterial color={liquidColor} />
      </mesh>

      <group name="pump">
        {/* Brushed champagne gold: the one piece of jewelry, revealed when the cap lifts. */}
        <mesh geometry={collar.geometry} position={collar.position} scale={collar.scale}>
          <meshPhysicalMaterial color="#d8b880" metalness={1} roughness={0.3} />
        </mesh>
        <mesh geometry={nozzle.geometry} position={nozzle.position} scale={nozzle.scale}>
          <meshPhysicalMaterial color="#0b0b0b" roughness={0.4} clearcoat={0.4} />
        </mesh>
        <mesh geometry={nozzle_hole.geometry} position={nozzle_hole.position} scale={nozzle_hole.scale}>
          <meshBasicMaterial color="#000000" />
        </mesh>
        <mesh name="spring" geometry={spring.geometry} position={spring.position} scale={spring.scale}>
          <meshStandardMaterial color="#c9c9c9" metalness={1} roughness={0.25} />
        </mesh>
        <mesh name="dip_tube" geometry={dip_tube.geometry} position={dip_tube.position} scale={dip_tube.scale}>
          <meshPhysicalMaterial color="#ffffff" roughness={0.2} transparent opacity={0.15} depthWrite={false} />
        </mesh>
      </group>

      <group ref={capPivotRef} position={[0, capBaseY, 0]} userData={{ restY: capBaseY }}>
        <mesh name="cap" geometry={cap.geometry} position={[0, cap.position.y - capBaseY, 0]} scale={cap.scale}>
          <meshPhysicalMaterial color="#050505" roughness={0.15} clearcoat={1} clearcoatRoughness={0.08} />
        </mesh>
        <ReflectionOverlay
          geometry={cap.geometry}
          position={[0, cap.position.y - capBaseY, 0]}
          scale={cap.scale}
          f0={0.05}
          intensity={12}
          width={0.08}
        />
        {/* A hairline gold band at the cap's base: jewelry, small and precise. */}
        <mesh position-y={CAP_BAND_HEIGHT / 2}>
          <cylinderGeometry args={[capBandRadius * 1.006, capBandRadius * 1.006, CAP_BAND_HEIGHT, 128, 1, true]} />
          <meshPhysicalMaterial color="#d8b880" metalness={1} roughness={0.22} />
        </mesh>
      </group>
    </group>
  )
}

useGLTF.preload(MODEL_URL)
