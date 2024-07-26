import {
  MaterialProps,
  MeshStandardMaterialProps,
  useLoader,
} from '@react-three/fiber';
import {
  DataTexture,
  NoColorSpace,
  TangentSpaceNormalMap,
  Texture,
  TextureLoader,
} from 'three';
import { useLayoutEffect, useMemo } from 'react';
import { useControls } from 'leva';

// @ts-expect-error
import { TextureImageData } from 'three/src/textures/types';
import { height2normal } from './normal_map_utils';
import { MaterialTypes } from './three_materials';

// export function SimpleMaterial({_key, displacementMap, normalMap, ...rest}) {
//     const dM = useLoader(TextureLoader, displacementMap);
//     const nM = useLoader(TextureLoader, normalMap);
//
//     return (
//         <meshPhongMaterial
//             attach="material"
//             displacementMap={dM}
//             normalMap={nM}
//             normalMap-colorSpace={NoColorSpace}
//             {...rest}
//         />
//     );
// }

const isLoaded = (image: TextureImageData) =>
  image?.complete && image.naturalHeight !== 0;

type HeightMaterialProps = Omit<MaterialProps, 'normalMap'> & {
  _key?: string;
  _ref?: unknown;
  type: MaterialTypes;

  normalMap?: string | string[] | false;
  displacementMap?: string | string[];

  normalScale: number | number[];
  displacementScale: number;
  [key: string]: unknown;
};

export function HeightMaterial({
  _key,
  _ref,
  type = 'standard',
  normalMap,
  displacementMap,
  normalScale = [1, 1],
  displacementScale = 1,
  ...rest
}: HeightMaterialProps) {
  const MType = `mesh${type.charAt(0).toUpperCase()}${type.slice(1)}Material`;

  const displacementTexture = useLoader(
    TextureLoader,
    displacementMap || [],
  ) as Texture;
  if (displacementTexture) displacementTexture.colorSpace = NoColorSpace;

  const width = displacementTexture.image?.width;
  const height = displacementTexture.image?.height;

  const loadedNormal = useLoader(TextureLoader, normalMap || []) as Texture;
  if (loadedNormal) loadedNormal.colorSpace = NoColorSpace;

  const normalData = useMemo<Uint8ClampedArray>(() => {
    const m = new Uint8ClampedArray(4 * width * height);
    m.fill(255);
    return m;
  }, [width, height]);

  const computedNormal = useMemo<
    null | (Texture & { flipY: boolean })
  >((): null | DataTexture => {
    // allow using normalMap === false to turn off the normal calculation
    if (normalMap || normalMap === false) return null;
    const texture = new DataTexture(normalData, width, height);
    // flip the image when sending to GPU.
    texture.flipY = true;
    texture.colorSpace = NoColorSpace;
    return texture;
  }, [normalMap, width, height]);

  useLayoutEffect(() => {
    if (!!normalMap || normalMap === false) return;
    if (!isLoaded(displacementTexture.image)) return;
    if (!computedNormal || !computedNormal.image) return;

    height2normal(displacementTexture.image, normalData, computedNormal.flipY);
    computedNormal.image = { data: normalData, width, height };
    computedNormal.colorSpace = NoColorSpace;
    computedNormal.needsUpdate = true;
  }, [normalMap, displacementTexture.image, width, height]);

  // prettier-ignore
  const folderName = `${_key} Height Map`;
  const controls = useControls(
    folderName,
    {
      displacementScale: {
        value: displacementScale,
        render: (): boolean => !!displacementMap,
        options: { min: 0, step: 0.01 },
      },
      normalScale: {
        value: normalScale,
        render: (): boolean => !!displacementMap && normalMap !== false,
        options: { min: 0, step: 0.01 },
      },
    },
    [displacementMap, displacementScale, normalMap, normalScale],
  );

  const props: MeshStandardMaterialProps = {};
  // assert material type is MeshStandardMaterial.
  if (displacementMap) {
    props.displacementMap = displacementTexture;
    props['displacementMap-colorSpace'] = NoColorSpace;
  }
  if (normalMap) props.normalMap = loadedNormal;
  else if (displacementMap) props.normalMap = computedNormal;
  if (props.normalMap) {
    props.normalMapType = TangentSpaceNormalMap;
    props['normalMap-colorSpace'] = NoColorSpace;
  }

  return (
    <MType
      ref={_ref}
      key={_key}
      attach='material'
      {...props}
      {...controls}
      {...rest}
    />
  );
}
