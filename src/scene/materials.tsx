import { MeshTransmissionMaterial } from '@react-three/drei'
import type { WebGLProgramParametersWithUniforms } from 'three'

/** Clear glass. MeshTransmissionMaterial on desktop; three's cheaper physical transmission when lite. */
export function GlassMaterial({ lite }: { lite: boolean }) {
  if (lite) {
    return <meshPhysicalMaterial transmission={1} thickness={1.2} roughness={0.05} ior={1.5} specularIntensity={1} />
  }
  // `backside` would add inner-wall reflections but costs ~11 fps on an Intel HD 530; left off.
  return (
    <MeshTransmissionMaterial
      transmission={1}
      thickness={0.7}
      roughness={0.04}
      ior={1.5}
      chromaticAberration={0.015}
      anisotropicBlur={0}
      distortion={0}
      samples={6}
      resolution={512}
    />
  )
}

// Fake backlight. Real transmission on the liquid costs ~28 fps (a second transmission pass inside
// the glass's), so the liquid is opaque and its glow is shaped here instead: brightest in the middle
// of each face, falling off toward the corners where light crosses more liquid, lifting toward the top.
// Positions are the quantized mesh's local space: x/z in [-1, 1], y in about [-0.75, 0.75].
function injectBacklight(shader: WebGLProgramParametersWithUniforms) {
  shader.vertexShader = shader.vertexShader
    .replace('#include <common>', '#include <common>\nvarying vec3 vLiquidPos;')
    .replace('#include <begin_vertex>', '#include <begin_vertex>\nvLiquidPos = position;')
  shader.fragmentShader = shader.fragmentShader
    .replace('#include <common>', '#include <common>\nvarying vec3 vLiquidPos;')
    .replace(
      '#include <emissivemap_fragment>',
      `#include <emissivemap_fragment>
      float toCorner = min(abs(vLiquidPos.x), abs(vLiquidPos.z));
      float core = 1.0 - smoothstep(0.1, 0.95, toCorner);
      float height = smoothstep(-0.75, 0.75, vLiquidPos.y);
      totalEmissiveRadiance *= mix(0.12, 1.5, core * core) * mix(0.7, 1.2, height);`,
    )
}

/** Perfume. The studio has almost no diffuse light, so the shaped emissive carries the edition color. */
export function LiquidMaterial({ color }: { color: string }) {
  return (
    <meshPhysicalMaterial
      color="#000000"
      emissive={color}
      emissiveIntensity={0.7}
      roughness={0.35}
      onBeforeCompile={injectBacklight}
    />
  )
}
