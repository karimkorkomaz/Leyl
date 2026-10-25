import { CanvasTexture, LinearFilter, SRGBColorSpace } from 'three'

/**
 * A soft radial gradient baked into a small canvas texture. Stops are [offset 0–1, CSS color].
 * Pass `background` to bake the glow over an opaque color: an opaque plane is visible to three's
 * transmission pass (which ignores transparent objects), and with toneMapped={false} its edges
 * match a scene background of the same color exactly.
 */
export function radialTexture(stops: readonly (readonly [number, string])[], { background = '', size = 256 } = {}) {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  if (background) {
    ctx.fillStyle = background
    ctx.fillRect(0, 0, size, size)
  }
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  for (const [offset, color] of stops) gradient.addColorStop(offset, color)
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  // No mipmaps: at grazing angles (the floor, seen from afar) a small mip averages the whole glow
  // into a flat brightness step at the plane's edge. A smooth gradient doesn't alias without them.
  texture.generateMipmaps = false
  texture.minFilter = LinearFilter
  return texture
}
