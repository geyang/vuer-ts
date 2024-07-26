import { PropsWithChildren, useEffect, useLayoutEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import {
  Euler,
  Mesh,
  OrthographicCamera,
  PerspectiveCamera,
  PlaneGeometry,
  Vector3,
} from 'three';
import { Matrix16T, QuaternionT, VuerProps } from '../vuer';
import { useXR } from '@react-three/xr';
import {
  VideoMaterial,
  VideoMaterialProps,
  WebRTCVideoMaterial,
  WebRTCVideoMaterialProps,
} from './primitives/video_display/WebRTCVideoMaterial';

export type HUDPlaneProps = PropsWithChildren<{
  distanceToCamera?: number;
  aspect?: number;
  height?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  quaternion?: QuaternionT;
  matrix?: Matrix16T;
  fixed?: boolean | undefined;
  side?: number;
  layers?: number;
}>;

export function HUDPlane({
  distanceToCamera = 10,
  aspect,
  height,
  position,
  rotation,
  quaternion,
  matrix,
  fixed = false,
  layers = null,
  children,
}: HUDPlaneProps) {
  const planeRef = useRef<Mesh<PlaneGeometry>>();

  const { camera }: { camera: PerspectiveCamera | OrthographicCamera } =
    useThree();

  const isPresenting = useXR((state) => state.isPresenting);

  useEffect(() => {
    if (!planeRef.current) return;
    if (typeof layers === 'number' && isPresenting) {
      planeRef.current.layers.set(layers);
    }
  }, [layers, planeRef.current, isPresenting]);

  useLayoutEffect(() => {
    if (!planeRef.current || !fixed) return;
    const plane = planeRef.current;
    if (matrix) {
      plane.matrix.fromArray(matrix);
      plane.matrix.decompose(plane.position, plane.quaternion, plane.scale);
      plane.rotation.setFromQuaternion(plane.quaternion);
    } else {
      if (quaternion) plane.quaternion.fromArray(quaternion);
      else if (rotation) plane.rotation.set(...rotation);
      if (position) plane.position.set(...position);
    }
  }, [matrix, quaternion, rotation, position, fixed]);

  useFrame(() => {
    const plane = planeRef.current;
    // note: only works with perspective camera
    let h: number;
    let w: number;
    let asp: number;
    if (typeof height === 'number' && typeof aspect === 'number') {
      plane.scale.set(height * aspect, height, 1);
    } else if (camera.type === 'PerspectiveCamera') {
      const c = camera as PerspectiveCamera;
      if (typeof height === 'number') {
        h = height;
      } else {
        h = 2 * Math.tan((c.fov / 360) * Math.PI) * distanceToCamera;
      }
      if (typeof aspect === 'number') {
        asp = aspect;
      } else {
        asp = c.aspect;
      }
      w = asp * h;
      plane.scale.set(w, h, 1);
    } else if (camera.type === 'OrthographicCamera') {
      // handle Orthographic Camera
      const c = camera as OrthographicCamera;
      h = (c.top - c.bottom) / camera.zoom;
      w = (c.right - c.left) / camera.zoom;
      plane.scale.set(w, h, 1);
    } else {
      console.warn('Unsupported camera type', camera.type);
    }

    if (fixed) return;

    if (matrix) {
      plane.matrix.fromArray(matrix);
      plane.matrix.premultiply(camera.matrixWorld);
      plane.matrix.decompose(plane.position, plane.quaternion, plane.scale);
      plane.rotation.setFromQuaternion(plane.quaternion);
      return;
    }

    // @ts-ignore: use placeholder for scale.
    camera.matrixWorld.decompose(plane.position, camera.quaternion, []);
    if (quaternion) {
      plane.quaternion.fromArray(quaternion);
      plane.quaternion.premultiply(camera.quaternion);
    } else if (rotation) {
      plane.quaternion.setFromEuler(new Euler().fromArray(rotation));
      plane.quaternion.premultiply(camera.quaternion);
    } else {
      plane.quaternion.copy(camera.quaternion);
    }

    const [x, y, z] = position || [0, 0, 0];
    const dirVec = new Vector3(x, y, z - distanceToCamera).applyQuaternion(
      camera.quaternion,
    );
    plane.position.add(dirVec);
  });

  return (
    <mesh ref={planeRef} scale={[1, 1, 1]}>
      <planeGeometry args={[1, 1]} />
      {children}
    </mesh>
  );
}

export type VideoPlaneProps = VuerProps<{
  src: string;
}> &
  HUDPlaneProps &
  WebRTCVideoMaterialProps &
  VideoMaterialProps;

export function VideoPlane({ src, start = true, ...props }: VideoPlaneProps) {
  return (
    <HUDPlane {...props}>
      <VideoMaterial src={src} start={start} {...props} />
    </HUDPlane>
  );
}

export type WebRTCVideoPlaneProps = VuerProps<{
  src: string;
}> &
  HUDPlaneProps &
  WebRTCVideoMaterialProps;

export function WebRTCVideoPlane({
  src,
  start = true,
  iceServer,
  webRTCOptions,
  ...props
}: WebRTCVideoPlaneProps) {
  return (
    <HUDPlane {...props}>
      <WebRTCVideoMaterial
        src={src}
        start={start}
        iceServer={iceServer}
        webRTCOptions={webRTCOptions}
      />
    </HUDPlane>
  );
}
