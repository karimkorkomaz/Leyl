import { useEffect } from 'react'
import { heroPose } from '../motion/poses'
import { sceneState } from '../motion/sceneState'
import { Backdrop } from './Backdrop'
import { Bottle } from './Bottle'
import { Floor } from './Floor'
import { Lighting } from './Lighting'
import { useSceneDriver } from './useSceneDriver'
import { Wordmark } from './Wordmark'

export function Experience({ mobile }: { mobile: boolean }) {
  const { pose, lift, spin, capPivot } = useSceneDriver()

  useEffect(() => {
    Object.assign(sceneState.base, mobile ? heroPose.mobile : heroPose.desktop)
  }, [mobile])

  return (
    <>
      <Lighting />
      <Wordmark mobile={mobile} />
      <group ref={pose}>
        <Backdrop />
        <Floor />
        <group ref={lift}>
          <group ref={spin}>
            <Bottle lite={mobile} capPivotRef={capPivot} />
          </group>
        </group>
      </group>
    </>
  )
}
