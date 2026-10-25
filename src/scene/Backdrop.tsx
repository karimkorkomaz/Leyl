import { useMemo, useRef } from 'react'
import { Vector3, type ShaderMaterial } from 'three'
import { useFrame } from '@react-three/fiber'
import { srgb } from '../motion/sceneState'
import { atmosphere } from '../motion/atmosphere'
import { ink } from '../lib/cssVar'

// The aura: a soft glow behind the bottle, the studio's backlight. It lives in the scene (not the
// DOM) so the glass refracts it. Opaque over ink, so the mobile glass's transmission pass (which
// ignores transparent objects) sees it too; edges fade exactly to the page background.
// Color, size and strength come from the atmosphere each frame (The Notes shifts its tone).

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

// Mixed in sRGB like the canvas gradient it replaces, then linearized for three's output stage.
const fragmentShader = /* glsl */ `
  uniform vec3 uInk;
  uniform vec3 uCore;
  uniform vec3 uOuter;
  uniform float uStrength;
  uniform float uRadius;
  varying vec2 vUv;

  vec3 toLinear(vec3 c) {
    return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(vec3(0.04045), c));
  }

  void main() {
    float edge = length(vUv - 0.5) * 2.0;
    float r = edge / uRadius;
    float r2 = r * r;
    // The plane is a fixed size: whatever the radius, fade to nothing before its edges.
    float glow = uStrength * (0.6 * exp(-r2 / 0.045) + 0.2 * exp(-r2 / 0.2)) * (1.0 - smoothstep(0.8, 1.0, edge));
    vec3 color = mix(uOuter, uCore, exp(-r2 / 0.06));
    vec3 srgbOut = mix(uInk, color, clamp(glow, 0.0, 1.0));
    gl_FragColor = vec4(toLinear(srgbOut), 1.0);
    #include <colorspace_fragment>
  }
`

export function Backdrop() {
  const material = useRef<ShaderMaterial>(null)
  const uniforms = useMemo(() => {
    const i = srgb(ink())
    return {
      uInk: { value: new Vector3(i.r, i.g, i.b) },
      uCore: { value: new Vector3() },
      uOuter: { value: new Vector3() },
      uStrength: { value: 1 },
      uRadius: { value: 1 },
    }
  }, [])

  useFrame(() => {
    const u = material.current?.uniforms
    if (!u) return
    const { auraCore: c, auraOuter: o } = atmosphere
    u.uCore.value.set(c.r, c.g, c.b)
    u.uOuter.value.set(o.r, o.g, o.b)
    u.uStrength.value = atmosphere.auraStrength
    u.uRadius.value = atmosphere.auraRadius
  })

  return (
    <mesh position={[0, 2.1, -5]}>
      <planeGeometry args={[9, 9]} />
      <shaderMaterial ref={material} vertexShader={vertexShader} fragmentShader={fragmentShader} uniforms={uniforms} toneMapped={false} />
    </mesh>
  )
}
