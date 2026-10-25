import { useRef } from 'react'
import { MathUtils, Vector3, type Group, type PerspectiveCamera } from 'three'
import { useFrame } from '@react-three/fiber'
import { float } from '../motion/poses'
import { layerList, sceneState } from '../motion/sceneState'
import { anchorIds, anchorPoints, emitAnchors, screenAnchors } from './anchors'

const TAU = Math.PI * 2
const tiltAxis = new Vector3()
const projected = new Vector3()

/**
 * The one frame loop: compose base + Σ layers + idle, then apply to camera and bottle, then project
 * the callout anchors to the screen for the DOM. Returns the refs for the bottle rig's nested groups.
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
    let targetY = base.targetY
    for (const l of layerList) {
      x += l.x
      y += l.y
      rotY += l.rotY
      capLift += l.capLift
      capTilt += l.capTilt
      camY += l.camY
      camZ += l.camZ
      targetY += l.targetY
    }

    const camera = state.camera as PerspectiveCamera
    camera.position.set(0, camY, camZ)
    camera.lookAt(0, targetY, 0)
    camera.updateMatrixWorld()

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

    // Lean the cap about the view axis (world Z) whatever the bottle's spin, so a positive tilt
    // always reads as a clockwise lean on screen. World Z expressed in the spin group's frame:
    const capRestY = capPivot.userData.restY as number
    capPivot.position.y = capRestY + capLift
    tiltAxis.set(-Math.sin(rotY), 0, Math.cos(rotY))
    capPivot.quaternion.setFromAxisAngle(tiltAxis, -capTilt)

    // Project the callout anchors (lift-group frame → world → viewport pixels).
    const s = base.scale
    for (const id of anchorIds) {
      const p = anchorPoints[id]
      const py = p.onCap ? capRestY + capLift + p.y : p.y
      projected.set(pose.position.x + s * p.x, s * (lift.position.y + py), s * p.z).project(camera)
      screenAnchors[id].x = ((projected.x + 1) / 2) * state.size.width
      screenAnchors[id].y = ((1 - projected.y) / 2) * state.size.height
    }
    emitAnchors()
  })

  return { pose: poseRef, lift: liftRef, spin: spinRef, capPivot: capPivotRef }
}
