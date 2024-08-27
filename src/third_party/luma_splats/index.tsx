import { LumaSplatsThree } from '@lumaai/luma-web/dist/@types/library/LumaSplatsThree';
import { extend, Object3DNode } from '@react-three/fiber';
import { useEffect, useState } from 'react';

// For typeScript support:
declare module '@react-three/fiber' {
  interface ThreeElements {
    lumaSplats: Object3DNode<LumaSplatsThree, typeof LumaSplatsThree>;
  }
}

const SEMANTICS_LAYERS = {
  all: 255,
  foregrounds: 2,
  backgrounds: 1,
};

let isLoaded = false;

async function register(
  callback = (newStatus: boolean): void => {
    isLoaded = newStatus;
  },
) {
  const isSSR = typeof window === 'undefined';
  if (isSSR) return;
  const { LumaSplatsThree } = await import('@lumaai/luma-web');

  // Make LumaSplatsThree available to R3F
  extend({ LumaSplats: LumaSplatsThree });
  callback(true);
}

export type SplatsProps = {
  src: string;
  semantics: string;
  [key: string]: unknown;
};

export default function Splats({
  src,
  semantics = 'all',
  ...props
}: SplatsProps) {
  const [status, setStatus] = useState(isLoaded);

  useEffect(() => {
    const r = async () => {
      console.log(
        'registering LumaSplats component. This should occur only once.',
      );
      await register((newStatus: boolean): void => {
        setStatus(newStatus);
        isLoaded = newStatus;
      });
    };
    if (!isLoaded) r();
  }, []);

  if (!status) return null;

  return (
    <lumaSplats
      semanticsMask={SEMANTICS_LAYERS[semantics]}
      source={src}
      {...props}
    />
  );
}