import { Edges } from '@react-three/drei';
import { MeshProps } from '@react-three/fiber';

// export function AABB({ levaPrefix = "Scene" }) {
//   const { use, min, max } = useControls("AABB", {
//     use,
//     min: { value: [-1, -1, -1] },
//     max: { value: [1, 1, 1] },
//   });
//   return renderParams.sceneBox ? (
//     <BBox min={renderParams.sceneBoxMin} max={renderParams.sceneBoxMax} />
//   ) : null;
// }

type BBoxProps = MeshProps & {
  min: { x: number; y: number; z: number };
  max: { x: number; y: number; z: number };
  color?: string;
  scale?: number;
};

export function BBox({
  // use three.js convention
  min = { x: -1, y: -1, z: -1 },
  max = { x: 1, y: 1, z: 1 },
  color = '0xffffff',
  scale = 1.01,
  ..._
}: BBoxProps) {
  // const scale = 2
  const dimension: number[] = [max.x - min.x, max.y - min.y, max.z - min.z];
  const position: number[] = [
    min.x + dimension[0] / 2,
    min.y + dimension[1] / 2,
    min.z + dimension[2] / 2,
  ];
  return (
    // @ts-ignore: fixme
    <mesh position={position} {..._}>
      {/* @ts-ignore: fixme */}
      <boxGeometry args={dimension} />
      {/* to enable transparency, so that objects behind gets a render pass. */}
      <meshBasicMaterial transparent depthWrite={false} opacity={0} />
      <Edges scale={scale} color={color} />
    </mesh>
  );
}
