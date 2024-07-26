import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import {
  LinearFilter,
  Mesh,
  MeshBasicMaterial,
  NearestFilter,
  NoColorSpace,
  PerspectiveCamera,
  Side,
  SphereGeometry,
  Texture,
} from 'three';
import { Args } from '@react-three/drei';
import { useXR } from '@react-three/xr';

function interpolateTexture(texture: Texture, interpolate: boolean) {
  if (!texture) return;
  if (interpolate) {
    texture.minFilter = LinearFilter;
    texture.magFilter = LinearFilter;
  } else {
    texture.minFilter = NearestFilter;
    texture.magFilter = NearestFilter;
  }
}

export type ImageSphereProps = {
  matRef?: React.MutableRefObject<MeshBasicMaterial>;
  rgb?: Texture;
  alpha?: Texture;
  depth?: Texture;
  depthScale?: number;
  depthBias?: number;
  distanceToCamera?: number;
  opacity?: number;
  fixed?: boolean | undefined;
  layers?: number;
  side?: number;
  wireframe?: boolean;
  material?;
};

export default function ImageSphere({
  matRef,
  rgb,
  alpha,
  depth,
  depthScale = 1,
  depthBias = 0,
  distanceToCamera = 1.0, // default to 1. for occlusion.
  opacity = 1.0,
  fixed = false,
  layers = null,
  side = 2,
  wireframe = false,
  material = {},
}: ImageSphereProps) {
  const sphereRef = useRef<Mesh<SphereGeometry>>();

  // make new component for just the projection.
  const { camera }: { camera: PerspectiveCamera } = useThree();

  const isPresenting = useXR((state) => state.isPresenting);
  useEffect(() => {
    if (!sphereRef.current) return;
    if (typeof layers === 'number' && isPresenting) {
      sphereRef.current.layers.set(layers);
    }
  }, [layers, sphereRef.current, isPresenting]);

  /**
   * This is the uv mapping for the stereoscopic projection. Should move
   * this to the GPU since it is expensive.
   * */
  // useEffect(() => {
  //   if (camera.type !== "PerspectiveCamera") {
  //     console.warn("ImageSphere only works with perspective camera");
  //     return;
  //   }
  //   const c = camera as PerspectiveCamera;
  //
  //   const cyRad = c.fov / 360 * Math.PI
  //   const cxRad = Math.atan(Math.tan(cyRad) * c.aspect)
  //
  //   const {
  //     uv: uvAttribute,
  //     normal
  //   } = sphereRef.current.geometry.attributes;
  //
  //   for (let i = 0; i < normal.count; i += 1) {
  //     const nY = normal.getY(i);
  //     const nX = normal.getX(i);
  //     const nZ = normal.getZ(i);
  //
  //     const u = -0.5 * nX / nZ / Math.sin(cxRad) * Math.sqrt(1 - Math.sin(cxRad) ** 2);
  //     const v = 0.5 * nY / nZ / Math.sin(cyRad) * Math.sqrt(1 - Math.sin(cyRad) ** 2);
  //
  //     uvAttribute.setXY(i, u + 0.5, v + 0.5);
  //   }
  //   uvAttribute.needsUpdate = true;
  //
  // }, [ camera.fov, camera.aspect ])

  // note: only works with perspective camera
  const args: Args<typeof SphereGeometry> = useMemo(() => {
    if (camera.type !== 'PerspectiveCamera') {
      console.warn('ImageSphere only works with perspective camera');
      return;
    }
    const c = camera as PerspectiveCamera;

    const cyRad = (c.fov / 360) * Math.PI;
    const cxRad = Math.atan(Math.tan(cyRad) * c.aspect);

    // todo: changing the arguments to the sphere will affect the uv map, because it effectively regenerates
    //       a new sphere geometry.
    const img = (rgb || depth)?.image;
    const args = [
      distanceToCamera,
      img?.width,
      img?.height,
      -0.5 * Math.PI - cxRad,
      2 * cxRad,
      0.5 * Math.PI - cyRad,
      2 * cyRad,
    ];
    // the sphere needs to re-construct anyways.
    return args as Args<typeof SphereGeometry>;
  }, [camera.fov, camera.aspect]);

  useFrame(() => {
    if (!sphereRef.current) return;
    if (fixed) return;
    const sphere = sphereRef.current;
    // @ts-ignore: use placeholder for scale.
    camera.matrixWorld.decompose(sphere.position, camera.quaternion, []);
    sphere.quaternion.copy(camera.quaternion);
  });

  const matProp = useMemo(() => {
    if (depth?.image)
      return { 'displacementMap-colorSpace': NoColorSpace, ...material };
    return material;
  }, [depth, material]);

  if (depth?.image) {
    return (
      <mesh ref={sphereRef} scale={[1, 1, 1]}>
        <sphereGeometry args={args} />
        <meshStandardMaterial
          ref={matRef}
          attach='material'
          map={rgb}
          alphaMap={alpha}
          displacementMap={depth}
          // No need to invert because we are looking from inside.
          displacementScale={depthScale}
          displacementBias={depthBias}
          wireframe={wireframe}
          transparent={!!alpha || typeof opacity == 'number'}
          opacity={opacity}
          side={side as Side}
          {...matProp}
        />
      </mesh>
    );
  } else
    return (
      <mesh ref={sphereRef} scale={[1, 1, 1]}>
        <sphereGeometry args={args} />
        <meshBasicMaterial
          ref={matRef}
          attach='material'
          map={rgb}
          alphaMap={alpha}
          displacementScale={depthScale}
          displacementBias={depthBias}
          wireframe={wireframe}
          transparent={!!alpha || typeof opacity == 'number'}
          opacity={opacity}
          side={side as Side}
          // do not add the displacementMap color space attribute
          {...material}
        />
      </mesh>
    );
}
