import { useRef } from 'react'
import { MathUtils, type Group, type PerspectiveCamera } from 'three'
import { useFrame } from '@react-three/fiber'
import { float } from '../motion/poses'
import { layerList, sceneState } from '../motion/sceneState'

const TAU = Math.PI * 2

/**
 * The one frame loop: compose base + Σ layers + idle, then apply to camera and bottle.
 * Returns the refs to attach to the bottle rig's nested groups.
 */
export function useSceneDriver() {
  /** x drift + scale; also carries the floor, which must not float or spin. */
  const poseRef = useRef<Group>(null)
  /** y offset + idle float. */
  const liftRef = useRef<Group>(null)
  /** rotation around Y. */
  const spinRef = useRef<Group>(null)
  /** cap hinge at the cap's base edge. */
  const capPivotRef = useRef<Group>(null)

  useFrame((state) => {
    const { base, idle } = sceneState
    let x = base.x
    let y = base.y
    let rotY = base.rotY
    let capLift = 0
    let capTilt = 0
    let camY = base.camY
    let camZ = base.camZ
    for (const l of layerList) {
      x += l.x
      y += l.y
      rotY += l.rotY
      capLift += l.capLift
      capTilt += l.capTilt
      camY += l.camY
      camZ += l.camZ
    }

    const camera = state.camera as PerspectiveCamera
    camera.position.set(0, camY, camZ)
    camera.lookAt(0, base.targetY, 0)

    const pose = poseRef.current
    const lift = liftRef.current
    const spin = spinRef.current
    const capPivot = capPivotRef.current
    if (!pose || !lift || !spin || !capPivot) return

    // x is a fraction of the visible width at the bottle's depth.
    const visibleHeight = 2 * camZ * Math.tan(MathUtils.degToRad(camera.fov / 2))
    pose.position.x = x * visibleHeight * camera.aspect
    pose.scale.setScalar(base.scale)

    lift.position.y = y + Math.sin((state.clock.elapsedTime * TAU) / float.period) * float.amplitude * idle.float
    spin.rotation.y = rotY

    capPivot.position.y = (capPivot.userData.restY as number) + capLift
    capPivot.rotation.z = capTilt
  })

  return { pose: poseRef, lift: liftRef, spin: spinRef, capPivot: capPivotRef }
}
