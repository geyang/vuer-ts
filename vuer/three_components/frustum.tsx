import { MutableRefObject, useLayoutEffect, useMemo, useRef } from 'react';
import {
  ColorRepresentation,
  Euler,
  Group,
  Matrix4,
  Object3D,
  Quaternion,
  Vector3,
} from 'three';
import { Line, Sphere } from '@react-three/drei';
import { VuerProps } from '../vuer';

function equals(aArr: number[], bArr: number[]) {
  for (let i = 0; i < aArr.length; i++) {
    if (aArr[i] !== bArr[i]) return false;
  }
  return true;
}

type ptList = {
  [key: string]: Array<[number, number, number]>;
};

type FrustumProps = VuerProps<
  {
    position?: [number, number, number];
    rotation?: [number, number, number];
    matrix?: [
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
    ];
    aspect?: number;
    focus?: number;
    fov?: number;
    near?: number;
    far?: number;
    scale?: number;
    upScale?: number;
    focalLength?: number;
    showUp?: boolean;
    showFrustum?: boolean;
    showFocalPlane?: boolean;
    showImagePlane?: boolean;
    src?: string;
    colorOrigin?: ColorRepresentation;
    colorFrustum?: ColorRepresentation;
    colorCone?: ColorRepresentation;
    colorFocalPlane?: ColorRepresentation;
    colorUp?: ColorRepresentation;
    colorTarget?: ColorRepresentation;
    colorCross?: ColorRepresentation;
  },
  Group
>;

export function Frustum({
  _key,
  _ref,
  // type = "PerspectiveCamera",
  // label,
  position,
  rotation,
  matrix,
  aspect = 4 / 3,
  focus = 10,
  fov = 50,
  near = 0.1,
  far = 0.2,
  // only applies to the camera cone, for presentation
  scale = 1,
  upScale = 1,

  focalLength = 0.035,
  showUp = true,
  showFrustum = true,
  showFocalPlane = true,
  showImagePlane = false,
  // src = null,

  // colors for the helper
  // colorOrigin = 0xff0000,
  colorFrustum = 0xffaa00,
  colorCone = 0xff0000,
  colorFocalPlane = 'white',
  colorUp = 0x00aaff,
  colorTarget = 'green',
  colorCross = 0x333333,
  children,
}: FrustumProps) {
  const cache = useMemo(
    () => ({
      raw: null,
      matrix: new Matrix4(),
      position: new Vector3(0, 0, 0),
      rotation: new Euler(0, 0, 0),
      quaternion: new Quaternion(0, 0, 0, 0),
      scale: new Vector3(0, 0, 0),
    }),
    [],
  );

  let groupRef = useRef() as MutableRefObject<Object3D>;
  if (_ref) groupRef = _ref as unknown as MutableRefObject<Object3D>;

  useLayoutEffect(() => {
    if (!groupRef.current) return;

    if (matrix) {
      if (cache.raw && equals(cache.raw, matrix)) return;
      cache.raw = matrix;
      cache.matrix.fromArray(matrix);
      cache.matrix.decompose(
        groupRef.current.position,
        cache.quaternion,
        cache.scale,
      );
      groupRef.current.rotation.setFromQuaternion(cache.quaternion);
    } else if (position && rotation) {
      // @ts-ignore: don't know how to fix this.
      groupRef.current.position.set(...position);
      // @ts-ignore: don't know how to fix this.
      groupRef.current.rotation.set(...rotation);
      groupRef.current.updateMatrix();
    }
  }, [matrix, fov, focus, near, far]);

  const all_points = useMemo<ptList>((): ptList => {
    const tan = Math.tan((fov / 360) * Math.PI);

    const cy = tan * focus;
    const cx = aspect * cy;

    const cy_focal = tan * focalLength;
    const cx_focal = aspect * cy_focal;

    const cy_near = tan * near;
    const cx_near = aspect * cy_near;

    const cy_far = tan * far;
    const cx_far = aspect * cy_far;

    return {
      up: [
        [-cx_focal * 0.6, cy_focal * 1.05, -focalLength],
        [cx_focal * 0.6, cy_focal * 1.05, -focalLength],
        [0, cy_focal + Math.max(cy_focal * 0.4, cx_focal * 0.25), -focalLength],
        [-cx_focal * 0.6, cy_focal * 1.05, -focalLength],
      ],
      // prettier-ignore
      imagePlaneCone: [
        [ 0, 0, 0 ], [ -cx_focal, -cy_focal, -focalLength ],
        [ 0, 0, 0 ], [ cx_focal, -cy_focal, -focalLength ],
        [ 0, 0, 0 ], [ cx_focal, cy_focal, -focalLength ],
        [ 0, 0, 0 ], [ -cx_focal, cy_focal, -focalLength ],
      ],
      imagePlane: [
        [-cx_focal, -cy_focal, -focalLength],
        [cx_focal, -cy_focal, -focalLength],
        [cx_focal, cy_focal, -focalLength],
        [-cx_focal, cy_focal, -focalLength],
        [-cx_focal, -cy_focal, -focalLength],
      ],
      nearPlane: [
        [-cx_near, -cy_near, -near],
        [cx_near, -cy_near, -near],
        [cx_near, cy_near, -near],
        [-cx_near, cy_near, -near],
        [-cx_near, -cy_near, -near],
      ],
      cone: [
        [0, 0, 0],
        [-cx_near, -cy_near, -near],
        [0, 0, 0],
        [cx_near, -cy_near, -near],
        [0, 0, 0],
        [cx_near, cy_near, -near],
        [0, 0, 0],
        [-cx_near, cy_near, -near],
        [0, 0, 0],
        [-cx_near, -cy_near, -near],
      ],
      farPlane: [
        [-cx_far, -cy_far, -far],
        [cx_far, -cy_far, -far],
        [cx_far, cy_far, -far],
        [-cx_far, cy_far, -far],
        [-cx_far, -cy_far, -far],
      ],
      farPlaneFrustum: [
        [-cx_near, -cy_near, -near],
        [-cx_far, -cy_far, -far],
        [cx_near, -cy_near, -near],
        [cx_far, -cy_far, -far],
        [cx_near, cy_near, -near],
        [cx_far, cy_far, -far],
        [-cx_near, cy_near, -near],
        [-cx_far, cy_far, -far],
      ],
      focalPlane: [
        [-cx, -cy, -focus],
        [cx, -cy, -focus],
        [cx, cy, -focus],
        [-cx, cy, -focus],
        [-cx, -cy, -focus],
      ],
      crossHair: [
        [0, cy, -focus],
        [0, -cy, -focus],
        [cx, 0, -focus],
        [-cx, 0, -focus],
      ],
    };
  }, [fov, focus, aspect, near, far]);

  return (
    <group
      ref={groupRef as MutableRefObject<Group>}
      position={position}
      rotation={rotation}
      key={_key}
    >
      {/* <Sphere key="origin" position={[0, 0, 0]} material-color={colorOrigin} scale={scale * 0.002}/> */}
      {showUp ? (
        <Line
          key='up'
          scale={scale * upScale}
          points={all_points.up}
          color={colorUp}
          lineWidth={1}
        />
      ) : null}
      {showImagePlane ? (
        <Line
          key='image-plane-cone'
          scale={scale}
          points={all_points.imagePlaneCone}
          color={colorCone}
          lineWidth={2}
          segments
        />
      ) : null}
      {showImagePlane ? (
        <Line
          key='image-plane'
          scale={scale}
          points={all_points.imagePlane}
          color={colorFocalPlane}
          lineWidth={2}
        />
      ) : null}
      {showFrustum
        ? [
            <Line
              key='near-plane'
              points={all_points.nearPlane}
              color={colorFrustum}
              lineWidth={1}
            />,
            <Line
              key='cone'
              points={all_points.cone}
              color={colorCone}
              lineWidth={1}
              segments
            />,
            <Line
              key='far-plane'
              points={all_points.farPlane}
              color={colorFrustum}
              lineWidth={1}
            />,
            <Line
              key='far-plane-frustum'
              points={all_points.farPlaneFrustum}
              color={colorFrustum}
              lineWidth={1}
              segments
            />,
          ]
        : null}
      {showFocalPlane
        ? [
            <Sphere
              key='focus'
              position={[0, 0, -focus]}
              material-color={colorTarget}
              scale={0.2}
            />,
            <Line
              key='focal-plane'
              points={all_points.focalPlane}
              color={colorFocalPlane}
              lineWidth={1}
            />,
            <Line
              key='cross-hair'
              points={all_points.crossHair}
              color={colorCross}
              lineWidth={1}
              segments
            />,
          ]
        : null}
      {children}
    </group>
  );
}
