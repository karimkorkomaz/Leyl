import { useMemo, useRef } from 'react'
import {
  AdditiveBlending,
  Color,
  MathUtils,
  Vector2,
  Vector3,
  type BufferGeometry,
  type Mesh,
  type ShaderMaterial,
  type WebGLRenderer,
} from 'three'
import { useFrame } from '@react-three/fiber'
import { sceneState } from '../motion/sceneState'

// The light sweep, evaluated analytically instead of re-rendering the environment map
// (a live <Environment> drops an Intel HD 530 from 60 to 23 fps).
//
// The strip is a tall vertical line of light circling the bottle at a close, finite radius. Each
// overlay redraws a surface additively and asks, per pixel: how close does this pixel's reflection
// ray pass to that line? Because the light is near, not at infinity, its reflection slides across
// flat faces as it moves (a distant light would flash a whole face at once), rounded edges carry
// a moving highlight, and the cylindrical cap a travelling line.
//
// Optional `baseGlow` lights the thick glass base from inside with the liquid's color, brightest at
// grazing angles, so the base "holds the light". `baseTop` is the liquid's bottom in local y.

const vertexShader = /* glsl */ `
  varying vec3 vWorldPos;
  varying vec3 vWorldNormal;
  varying vec3 vLocalPos;
  void main() {
    vLocalPos = position;
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorldPos = world.xyz;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    // Same math as three's project_vertex, so depth matches the surface this overlay redraws.
    gl_Position = projectionMatrix * (modelViewMatrix * vec4(position, 1.0));
  }
`

const fragmentShader = /* glsl */ `
  uniform vec2 uStripPos;
  uniform float uWidth;
  uniform float uSweep;
  uniform float uF0;
  uniform vec3 uStripColor;
  uniform vec3 uGlowColor;
  uniform float uGlow;
  uniform float uBaseTop;
  uniform float uOnScreen;
  varying vec3 vWorldPos;
  varying vec3 vWorldNormal;
  varying vec3 vLocalPos;

  void main() {
    if (uOnScreen < 0.5) discard;
    vec3 N = normalize(vWorldNormal);
    vec3 V = normalize(cameraPosition - vWorldPos);
    float NdotV = max(dot(N, V), 0.0);
    vec3 R = reflect(-V, N);

    // Horizontal distance from the vertical strip to the reflection ray (only ahead of the surface).
    vec2 r = normalize(R.xz + vec2(1e-5));
    vec2 toStrip = uStripPos - vWorldPos.xz;
    float ahead = step(0.0, dot(toStrip, r));
    float miss = abs(r.x * toStrip.y - r.y * toStrip.x);
    // Gaussian, not a hard-edged band: the model's normals are 8-bit quantized, and a hard edge
    // turns their tiny steps into visible striations across flat faces.
    float band = exp(-(miss * miss) / (uWidth * uWidth)) * ahead;
    float tall = 1.0 - smoothstep(0.6, 0.95, abs(R.y));
    float fresnel = uF0 + (1.0 - uF0) * pow(1.0 - NdotV, 5.0);
    vec3 color = uStripColor * band * tall * fresnel * uSweep;

    float base = 1.0 - smoothstep(uBaseTop - 0.06, uBaseTop, vLocalPos.y);
    float edge = pow(1.0 - NdotV, 2.0);
    color += uGlowColor * base * (0.08 + 0.92 * edge) * uGlow;

    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
  }
`

/** The strip circles the bottle's vertical axis at this radius (world units). */
const STRIP_RADIUS = 3.2

/**
 * Strip azimuth (radians, atan2(z, x)) at the start and end of a sweep. At the -30° rest angle the
 * front face mirrors roughly 150° and the right face -30°; the path overshoots both so each face is
 * crossed while the strip is at full strength: front face, then the corner, then the right face.
 */
const SWEEP_FROM = (190 * Math.PI) / 180
const SWEEP_TO = (-70 * Math.PI) / 180

/** Fade in over the first 12% and out over the last 12%; full strength in between. */
const envelope = (t: number) => MathUtils.smoothstep(t, 0, 0.12) * (1 - MathUtils.smoothstep(t, 0.88, 1))

const center = new Vector3()

type ReflectionOverlayProps = {
  geometry: BufferGeometry
  position?: Vector3 | [number, number, number]
  scale: Vector3
  /** Reflectance at normal incidence: 0.04 for glass and lacquer. */
  f0: number
  /** Peak strip brightness (linear, before fresnel). */
  intensity: number
  /** Half-width of the strip's light line, world units. Narrower reads as a harder light. */
  width?: number
  baseGlow?: { color: string; strength: number; baseTop: number }
}

export function ReflectionOverlay({ geometry, position, scale, f0, intensity, width = 0.1, baseGlow }: ReflectionOverlayProps) {
  const uniforms = useMemo(
    () => ({
      uStripPos: { value: new Vector2() },
      uWidth: { value: width },
      uSweep: { value: 0 },
      uF0: { value: f0 },
      uStripColor: { value: new Color('#fff1dc').multiplyScalar(intensity) },
      uGlowColor: { value: new Color(baseGlow?.color ?? '#000000') },
      uGlow: { value: baseGlow?.strength ?? 0 },
      uBaseTop: { value: baseGlow?.baseTop ?? -2 },
      uOnScreen: { value: 1 },
    }),
    [width, f0, intensity, baseGlow?.color, baseGlow?.strength, baseGlow?.baseTop],
  )

  const mesh = useRef<Mesh>(null)
  const material = useRef<ShaderMaterial>(null)

  useFrame(() => {
    if (!mesh.current || !material.current) return
    const t = sceneState.idle.sweep
    const angle = SWEEP_FROM + (SWEEP_TO - SWEEP_FROM) * t
    // Circle the bottle wherever it currently stands (it drifts in later sections).
    mesh.current.getWorldPosition(center)
    material.current.uniforms.uStripPos.value.set(
      center.x + Math.cos(angle) * STRIP_RADIUS,
      center.z + Math.sin(angle) * STRIP_RADIUS,
    )
    material.current.uniforms.uSweep.value = envelope(t)
  })

  // Draw only in the on-screen pass. MeshTransmissionMaterial renders the scene into its own target
  // to refract it; an overlay in there comes back as a grainy, color-fringed ghost of itself.
  // (If a postprocessing composer is ever added, the main pass renders offscreen too: revisit.)
  const onBeforeRender = (renderer: WebGLRenderer) => {
    if (!material.current) return
    material.current.uniforms.uOnScreen.value = renderer.getRenderTarget() === null ? 1 : 0
    material.current.uniformsNeedUpdate = true
  }

  return (
    <mesh
      ref={mesh}
      name="reflection-overlay"
      geometry={geometry}
      position={position}
      scale={scale}
      renderOrder={1}
      onBeforeRender={onBeforeRender}
    >
      <shaderMaterial
        ref={material}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
        toneMapped={false}
        // Redrawing a surface that already wrote depth: bias toward the camera so it never z-fights.
        polygonOffset
        polygonOffsetFactor={-1}
        polygonOffsetUnits={-4}
      />
    </mesh>
  )
}
