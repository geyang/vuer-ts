import React, { useEffect, useMemo, useRef, useState, } from 'react';
import { useThree } from '@react-three/fiber';
import {
  LinearFilter,
  MeshBasicMaterial,
  NearestFilter,
  OrthographicCamera,
  PerspectiveCamera,
  Texture,
  TextureLoader,
} from 'three';
import ImagePlane, { ImagePlaneProps } from "./image_plane";
import ImageSphere, { ImageSphereProps } from "./image_sphere";
import { useControls } from "leva";

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

export type ImageBackgroundProps = {
  _key?: string;
  geometry?: 'plane' | 'sphere' | null;
  src?: string | Blob;
  alphaSrc?: string | Blob;
  depthSrc?: string | Blob;
  interpolate?: boolean;
  opacity?: number;
  levaPrefix?: string;
  [key: string]: unknown;
} & ImageSphereProps & ImagePlaneProps;

export function ImageBackground(
  {
    _key,
    geometry,
    src,
    alphaSrc,
    depthSrc,
    interpolate = false,
    // distanceToCamera = 10,
    // opacity = 1.0,
    depthScale = 1,
    depthBias = 0,
    fixed = false,
    levaPrefix = "Scene.",
    // side = 0,
    // wireframe = false,
    // material = {},
    ...rest
  }: ImageBackgroundProps,
) {
  const meshRef = useRef<MeshBasicMaterial>();
  const { camera }: { camera: PerspectiveCamera | OrthographicCamera } = useThree();

  const [ rgbTexture, setRGB ] = useState<Texture>();
  const [ alphaTexture, setAlpha ] = useState<Texture>();
  const [ depthTexture, setDepth ] = useState<Texture>();

  const loader = useMemo(() => new TextureLoader(), []);

  const blobOpts: unknown = useMemo(() => {
    if (depthTexture && camera.type === "PerspectiveCamera") return {};
    return { imageOrientation: 'flipY' };
  }, [ camera.type, depthTexture ]);

  useEffect(() => {
    if (!src) {
      setRGB(undefined);
    } else if (typeof src === 'string') {
      loader.load(src, setRGB);
    } else {
      const blob: ImageBitmapSource = new Blob([ src ], { type: 'image' });
      const texture = new Texture();
      createImageBitmap(blob, blobOpts).then((imageBitmap) => {
        texture.image = imageBitmap;
        texture.needsUpdate = true;
        if (meshRef.current) meshRef.current.needsUpdate = true;
        setRGB(texture);
      });
    }
  }, [ src, blobOpts ]);

  useEffect(() => {
    if (!alphaSrc) {
      setAlpha(undefined);
    } else if (typeof alphaSrc === 'string') {
      loader.load(alphaSrc, setAlpha);
    } else {
      const blob: ImageBitmapSource = new Blob([ alphaSrc ], { type: 'image' });
      const texture = new Texture();
      createImageBitmap(blob, blobOpts).then((imageBitmap) => {
        texture.image = imageBitmap;
        texture.needsUpdate = true;
        if (meshRef.current) meshRef.current.needsUpdate = true;
        setAlpha(texture);
      });
    }
  }, [ alphaSrc, blobOpts ]);

  useEffect(() => {
    if (!depthSrc) {
      setDepth(undefined);
    } else if (typeof depthSrc === 'string') {
      loader.load(depthSrc, setDepth);
    } else {
      const blob: ImageBitmapSource = new Blob([ depthSrc ], { type: 'image' });
      const texture = new Texture();
      createImageBitmap(blob, blobOpts).then((imageBitmap) => {
        texture.image = imageBitmap;
        texture.needsUpdate = true;
        if (meshRef.current) meshRef.current.needsUpdate = true;
        setDepth(texture);
      });
    }
  }, [ depthSrc, blobOpts ]);

  useEffect(() => {
    if (rgbTexture) interpolateTexture(rgbTexture, interpolate);
    if (alphaTexture) interpolateTexture(alphaTexture, interpolate);
    if (depthTexture) interpolateTexture(depthTexture, interpolate);
  }, [ rgbTexture, alphaTexture, depthTexture, interpolate ]);

  let prefix = levaPrefix ? `${levaPrefix}Image Background` : 'Image Background'
  prefix = _key ? `${prefix}-[${_key}]` : prefix;

  const ctrl = useControls(prefix, {
    fixed,
    depthScale: { value: depthScale, step: 0.01, label: "Depth Scale" },
    depthBias: { value: depthBias, step: 0.01, label: "Depth Offset" },
  }, [ fixed, depthScale, depthBias ]);

  if (geometry === 'plane') {
    return <ImagePlane matRef={meshRef} rgb={rgbTexture} alpha={alphaTexture}
      depth={depthTexture} {...ctrl} {...rest}/>;
  } else if (geometry === 'sphere') {
    return <ImageSphere matRef={meshRef} rgb={rgbTexture} alpha={alphaTexture} {...ctrl}
      depth={depthTexture} {...rest}/>;
  } else if (!depthTexture) {
    return <ImagePlane matRef={meshRef} rgb={rgbTexture} alpha={alphaTexture} {...ctrl} {...rest}/>;
  } else if (camera.type === 'OrthographicCamera') {
    return <ImagePlane matRef={meshRef} rgb={rgbTexture} alpha={alphaTexture}
      depth={depthTexture} {...ctrl} {...rest}/>;
  } else if (camera.type === 'PerspectiveCamera') {
    return <ImageSphere matRef={meshRef} rgb={rgbTexture} alpha={alphaTexture} {...ctrl}
      depth={depthTexture} {...rest}/>;
  }
  return null;
}
