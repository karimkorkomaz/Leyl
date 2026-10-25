import { Environment, Lightformer } from '@react-three/drei'

// A black studio lit only by strip softboxes. Everything here lives in the environment map,
// so it shows up as reflections on glass, gloss and gold rather than as lit surfaces.
//
// With the bottle at its -30° rest angle, the front face mirrors direction (-0.87, 0, 0.5) and the
// right face mirrors (0.87, 0, -0.5). The two broad softboxes sit on those directions so each face
// carries one long soft reflection; thin strips elsewhere only catch the rounded corners.
export function Lighting() {
  return (
    <Environment resolution={256} frames={1}>
      {/* Broad softboxes mirrored by the two visible faces */}
      <Lightformer form="rect" intensity={0.6} color="#fff4e8" scale={[0.6, 8, 1]} position={[-4.3, 2, 2.5]} target={[0, 2, 0]} />
      <Lightformer form="rect" intensity={0.5} color="#ffe9cf" scale={[0.5, 8, 1]} position={[4.3, 2, -2.5]} target={[0, 2, 0]} />
      {/* Thin hard strips for corner highlights and the cap */}
      <Lightformer form="rect" intensity={10} color="#fff3e2" scale={[0.15, 9, 1]} position={[-2, 2, 4.5]} target={[0, 2, 0]} />
      <Lightformer form="rect" intensity={8} color="#fff3e2" scale={[0.15, 9, 1]} position={[4.5, 2, 2]} target={[0, 2, 0]} />
      {/* Warm rims behind to outline the silhouette */}
      <Lightformer form="rect" intensity={10} color="#ffd9a8" scale={[0.2, 9, 1]} position={[-3.5, 2, -3]} target={[0, 2, 0]} />
      <Lightformer form="rect" intensity={8} color="#ffd9a8" scale={[0.2, 9, 1]} position={[3.5, 2, -3]} target={[0, 2, 0]} />
      {/* Faint overhead softbox so the cap's top and the shoulders read */}
      <Lightformer form="rect" intensity={1} scale={[4, 4, 1]} position={[0, 8, 0]} target={[0, 0, 0]} />
    </Environment>
  )
}
