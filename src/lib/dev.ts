/**
 * Dev-only debugging handle, exposed as `window.__leyl` (see main.tsx) for Playwright reviews:
 *   __leyl.gsap.globalTimeline.pause()            freeze all tweens
 *   __leyl.sceneState.idle.sweep = 0.5           pose the scene
 *   __leyl.three.scene.getObjectByName('liquid')  inspect or toggle meshes
 * Never read from app code; it is empty in production.
 */
export const dev: Record<string, unknown> = {}
