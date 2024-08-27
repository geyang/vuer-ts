import {
  MutableRefObject,
  PropsWithChildren,
  Ref,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react';
import { Points } from 'three';
import { half2float } from './half2float';
import { Matrix16T } from '../../vuer/interfaces';

type PointCloudProps = PropsWithChildren<{
  _key?: string;
  _ref?: Ref<Points>;
  // hide?: boolean;
  position?: [number, number, number];
  rotation?: [number, number, number];
  matrix?: Matrix16T;
  vertices: Uint16Array;
  colors?: Uint8Array;
  size?: number;
  color?: string | number;
}>;

export function PointCloud({
  _ref,
  _key,
  // hide,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  vertices,
  matrix,
  colors,
  size = 0.01,
  color,
  ...rest
}: PointCloudProps) {
  const __ref = useRef<Points>(null);
  const ref = (_ref || __ref) as MutableRefObject<Points>;

  const geometry = useMemo(
    () => ({
      /** note: use this to indicate the time of creation, and update the geometry when it changes.
     we do this to avoid the GL error. */
      now: Date.now(),
      // todo: experiment with google Drecon
      //   https://codelabs.developers.google.com/codelabs/draco-3d#0
      vertices: half2float(vertices),
      colors: colors && Float32Array.from(colors, (octet) => octet / 0xff),
    }),
    [vertices, colors],
  );

  useLayoutEffect(() => {
    const group = ref.current;
    if (!group) return;
    if (matrix) {
      group.matrix.fromArray(matrix);
      group.matrix.decompose(group.position, group.quaternion, group.scale);
      group.rotation.setFromQuaternion(group.quaternion);
    }
  }, [matrix, ref.current]);

  return (
    <points
      ref={_ref}
      // do this to avoid the GL error.
      key={_key + geometry.now}
      position={position}
      rotation={rotation}
      castShadow
      receiveShadow
      {...rest}
    >
      <bufferGeometry>
        <bufferAttribute
          attach='attributes-position'
          array={geometry.vertices}
          count={geometry.vertices.length / 3}
          itemSize={3}
        />
        {geometry.colors && (
          <bufferAttribute
            attach='attributes-color'
            array={geometry.colors}
            count={geometry.colors.length / 3}
            itemSize={3}
          />
        )}
      </bufferGeometry>
      <pointsMaterial
        attach='material'
        // only use vertex colors if it is provided.
        vertexColors={colors !== undefined}
        color={color}
        size={size}
      />
    </points>
  );
}
