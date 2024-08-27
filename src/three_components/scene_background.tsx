import { useThree } from '@react-three/fiber';
import { useEffect, useMemo, useState } from 'react';
import { NoColorSpace, Texture, TextureLoader } from 'three';
import { useControls } from 'leva';

interface BackgroundImageParams {
  src: string | BlobPart | undefined | null;
}

export function SceneBackground({ src }: BackgroundImageParams) {
  const { scene } = useThree();
  const loader: TextureLoader = useMemo(() => new TextureLoader(), []);
  const [rgbTexture, setRGB] = useState<Texture | undefined>();

  const is_empty = typeof src === 'string' && src?.length === 0;

  const { backgroundIntensity, backgroundBlurriness } = useControls(
    'Scene Background Image',
    {
      backgroundIntensity: -0.5,
      backgroundBlurriness: 0.0,
    },
  );

  useEffect(() => {
    if (!src || is_empty) return setRGB(undefined);
    if (typeof src === 'string') loader.load(src, setRGB);
    else {
      const blob: ImageBitmapSource = new Blob([src] as BlobPart[], {
        type: 'image',
      });
      const texture = new Texture();
      createImageBitmap(blob, { imageOrientation: 'flipY' }).then(
        (imageBitmap) => {
          texture.image = imageBitmap;
          texture.needsUpdate = true;
          texture.colorSpace = NoColorSpace;
          setRGB(texture);
        },
      );
    }
  }, [src]);

  useEffect(() => {
    scene.backgroundIntensity = backgroundIntensity;
    scene.backgroundBlurriness = backgroundBlurriness;
  }, [backgroundIntensity, backgroundBlurriness]);

  useEffect(() => {
    if (!rgbTexture) return;
    scene.background = rgbTexture;
  }, [rgbTexture, rgbTexture?.needsUpdate]);

  return null;
}
