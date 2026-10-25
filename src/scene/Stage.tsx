import { Suspense, useEffect, useState } from 'react'
import { NeutralToneMapping } from 'three'
import { Canvas } from '@react-three/fiber'
import { MEDIA } from '../motion/media'
import { useMediaQuery } from '../lib/useMediaQuery'
import { heroPose } from '../motion/poses'
import { ink } from '../lib/cssVar'
import { dev } from '../lib/dev'
import { Experience } from './Experience'

/** The one fixed, opaque canvas behind all DOM content. Never mount a second one. */
export function Stage() {
  const mobile = useMediaQuery(MEDIA.mobile)
  const [visible, setVisible] = useState(() => !document.hidden)
  const [background] = useState(ink)

  useEffect(() => {
    const onVisibility = () => setVisible(!document.hidden)
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  const { camY, camZ, targetY } = mobile ? heroPose.mobile : heroPose.desktop

  return (
    <div className="stage" aria-hidden="true">
      <Canvas
        frameloop={visible ? 'always' : 'never'}
        dpr={mobile ? [1, 1.5] : [1, 1.75]}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance', toneMapping: NeutralToneMapping }}
        camera={{ fov: 26, near: 0.1, far: 100, position: [0, camY, camZ] }}
        onCreated={(state) => {
          // The canvas is opaque, but offscreen passes (ContactShadows) expect to clear to transparent.
          state.gl.setClearAlpha(0)
          state.camera.lookAt(0, targetY, 0)
          if (import.meta.env.DEV) dev.three = state
        }}
      >
        <color attach="background" args={[background]} />
        <Suspense fallback={null}>
          <Experience mobile={mobile} />
        </Suspense>
      </Canvas>
    </div>
  )
}
