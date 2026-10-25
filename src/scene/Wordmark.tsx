import { useRef } from 'react'
import { AdditiveBlending, MathUtils, type Mesh, type PerspectiveCamera } from 'three'
import { Text } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { brand } from '../content'
import { wordmarkPose } from '../motion/poses'
import { markReady } from '../motion/ready'
import { sceneState } from '../motion/sceneState'

// troika's build rejects woff2, so the wordmark has its own TTF: Cormorant Garamond Light, subset by
// the Google Fonts API to just L, E, Y (2 KB). Re-download it with `&text=` if the brand name changes.
const FONT = '/fonts/cormorant-garamond-light-wordmark.ttf'

/** The bits of troika's Text mesh used here (its package doesn't expose its types). */
type TroikaText = Mesh & {
  clipRect: number[] | null
  textRenderInfo?: { visibleBounds: number[] }
}

/**
 * The giant LEYL behind the bottle. It lives in the scene, not the DOM, so the glass refracts it.
 * Drawn additively in a dim warm ivory: always a touch lighter than what's behind it, never a
 * dark cut-out against the backdrop glow.
 *
 * Sized to a fraction of the visible width at its depth every frame, revealed by sliding up behind
 * a fixed mask (troika's clipRect, kept still while the glyphs move), and carried off with the hero.
 */
export function Wordmark({ mobile }: { mobile: boolean }) {
  const text = useRef<TroikaText>(null)
  const pose = mobile ? wordmarkPose.mobile : wordmarkPose.desktop

  useFrame(({ camera }) => {
    const mesh = text.current
    const bounds = mesh?.textRenderInfo?.visibleBounds
    if (!mesh || !bounds) return
    const [minX, minY, maxX, maxY] = bounds
    const width = maxX - minX
    const height = maxY - minY

    const cam = camera as PerspectiveCamera
    const visibleHeight = 2 * (cam.position.z - pose.z) * Math.tan(MathUtils.degToRad(cam.fov / 2))
    const scale = (visibleHeight * cam.aspect * pose.widthFraction) / width
    mesh.scale.setScalar(scale)

    const { reveal, scroll } = sceneState.wordmark
    // Glyphs start one ink-height low; the mask (in the glyphs' local space) moves up to compensate.
    const drop = (1 - reveal) * height
    mesh.position.y = pose.y + scroll * visibleHeight * pose.parallax - drop * scale
    mesh.clipRect = [minX, minY + drop, maxX, maxY + drop]
  })

  return (
    <Text
      ref={text}
      font={FONT}
      characters={brand.name}
      fontSize={1}
      letterSpacing={0.1}
      anchorX="center"
      anchorY="middle"
      color="#211b16"
      position={[0, pose.y, pose.z]}
      onSync={() => markReady('wordmark')}
    >
      {brand.name}
      <meshBasicMaterial transparent depthWrite={false} blending={AdditiveBlending} toneMapped={false} />
    </Text>
  )
}
