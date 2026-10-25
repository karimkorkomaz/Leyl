import { useMemo, useRef } from 'react'
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  MathUtils,
  type PerspectiveCamera,
  type ShaderMaterial,
} from 'three'
import { useFrame } from '@react-three/fiber'
import { atmosphere } from '../motion/atmosphere'
import { sceneState } from '../motion/sceneState'

// The scent: particles rising from the cap in a few slow, swaying ribbons (shaped trails, never
// random dust). Mostly large, faint points that overlap into haze, with a few small bright specks.
// One Points object; every position is computed on the GPU from per-particle seeds and a phase the
// CPU advances, so nothing is uploaded per frame. Hidden unless The Notes shows it.

// Large additive points overlap a lot (fill-rate bound on integrated GPUs): 512 keeps the haze.
const COUNT = 512
const STREAMS = 6

const vertexShader = /* glsl */ `
  attribute vec4 aSeed;      // x: life offset, y: speed jitter, z: stream (0..1), w: jitter
  uniform float uPhase;
  uniform float uTime;
  uniform float uRise;
  uniform float uSize;
  uniform float uProjScale;
  varying float vAlpha;

  void main() {
    float life = fract(aSeed.x + uPhase * (0.75 + 0.5 * aSeed.y));
    float stream = floor(aSeed.z * ${STREAMS}.0);
    float sp = stream * 1.7;                      // each ribbon's own phase
    float angle = stream / ${STREAMS}.0 * 6.2832 + 0.4;

    // Born on a ring just above the cap, rising, widening and loosening as it climbs; it fades out
    // well before the top of the frame.
    vec3 p;
    p.y = 3.95 + life * 1.6 * uRise;
    float sway = sin(life * 2.6 + sp + uTime * 0.16) * 0.6 + cos(life * 1.3 + sp * 2.0 - uTime * 0.11) * 0.35;
    // It curls to the right as it climbs: the scent carries toward the words it names.
    p.x = cos(angle) * 0.4 + sway * life * 1.2 + life * life * 2.0;
    p.z = sin(angle) * 0.4 + cos(life * 2.1 + sp) * 0.45 * life;
    float j = (aSeed.w - 0.5);
    p.x += j * (0.2 + 0.45 * life);
    p.z += fract(aSeed.w * 7.31) * (0.15 + 0.3 * life) - (0.075 + 0.15 * life);
    p.y += fract(aSeed.w * 3.17) * 0.3;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    // Most particles are large and faint (they overlap into haze); about one in six is a small speck.
    float speck = step(0.83, fract(aSeed.w * 13.7));
    float size = uSize * mix(1.4, 0.32, speck) * (0.7 + 0.6 * fract(aSeed.w * 5.3)) * (1.0 + life * 0.9);
    gl_PointSize = size * uProjScale / -mv.z;
    // Fade in late (no hot cluster at birth) and dissolve inside the frame.
    vAlpha = smoothstep(0.0, 0.16, life) * (1.0 - smoothstep(0.45, 0.9, life)) * mix(0.11, 0.55, speck);
  }
`

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float soft = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(uColor * soft * soft * vAlpha * uOpacity, 1.0);
    #include <colorspace_fragment>
  }
`

function seedGeometry() {
  const geometry = new BufferGeometry()
  const seeds = new Float32Array(COUNT * 4)
  for (let i = 0; i < COUNT; i++) {
    seeds[i * 4] = Math.random()
    seeds[i * 4 + 1] = Math.random()
    seeds[i * 4 + 2] = (i % STREAMS) / STREAMS + 0.5 / STREAMS
    seeds[i * 4 + 3] = Math.random()
  }
  geometry.setAttribute('aSeed', new BufferAttribute(seeds, 4))
  // Positions come from the shader; three still wants a position attribute for draw counts.
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(COUNT * 3), 3))
  geometry.boundingSphere = null
  return geometry
}

/** World size of a particle, units. */
const BASE_SIZE = 0.09

/** On a narrow screen the same world-sized scent fills far more of the frame: quieter there. */
const MOBILE = { size: 0.72, opacity: 0.6 }

export function Particles({ mobile }: { mobile: boolean }) {
  const material = useRef<ShaderMaterial>(null)
  const phase = useRef(0)
  const geometry = useMemo(() => seedGeometry(), [])
  const uniforms = useMemo(
    () => ({
      uPhase: { value: 0 },
      uTime: { value: 0 },
      uRise: { value: 1 },
      uSize: { value: BASE_SIZE },
      uProjScale: { value: 1 },
      uColor: { value: new Color() },
      uOpacity: { value: 0 },
    }),
    [],
  )

  useFrame((state, delta) => {
    const m = material.current
    if (!m) return
    const a = atmosphere
    m.visible = a.particleOpacity * sceneState.idle.scent > 0.001
    if (!m.visible) return
    // Advance a phase instead of using time × speed, so speed changes never make particles jump.
    phase.current += Math.min(delta, 0.1) * 0.07 * a.particleSpeed
    const u = m.uniforms
    u.uPhase.value = phase.current
    u.uTime.value = state.clock.elapsedTime
    u.uRise.value = a.particleRise
    u.uSize.value = BASE_SIZE * a.particleSize * (mobile ? MOBILE.size : 1)
    u.uOpacity.value = a.particleOpacity * (mobile ? MOBILE.opacity : 1)
    u.uColor.value.setRGB(a.particleColor.r, a.particleColor.g, a.particleColor.b, 'srgb')
    const cam = state.camera as PerspectiveCamera
    u.uProjScale.value = (state.size.height * state.viewport.dpr) / (2 * Math.tan(MathUtils.degToRad(cam.fov / 2)))
  })

  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={material}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
        toneMapped={false}
      />
    </points>
  )
}
