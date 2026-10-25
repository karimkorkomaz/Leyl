import { getEditionData, subscribeEdition } from '../state/edition'
import { gsap } from './gsap'
import { sceneState, srgb } from './sceneState'

/**
 * Keep the scene's color in step with the active edition: the liquid, the base glow, the aura and
 * the scent all derive from sceneState.look.edition, which crossfades over ~1.2s (BRIEF: Editions).
 * Returns an unsubscribe function.
 */
export function followEdition() {
  return subscribeEdition(() => {
    gsap.to(sceneState.look.edition, { ...srgb(getEditionData().color), duration: 1.2, ease: 'power2.inOut', overwrite: true })
  })
}
