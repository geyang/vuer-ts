import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import {
  ACESFilmicToneMapping,
  CineonToneMapping,
  CustomToneMapping,
  LinearToneMapping,
  NoToneMapping,
  ReinhardToneMapping,
} from 'three';
import { useControls } from 'leva';
import { VuerProps } from '../vuer';

const TONE_MAPPING_OPTIONS = {
  None: NoToneMapping,
  Linear: LinearToneMapping,
  Reinhard: ReinhardToneMapping,
  Cineon: CineonToneMapping,
  ACESFilmic: ACESFilmicToneMapping,
  Custom: CustomToneMapping,
};

type ToneMappingParams = VuerProps<{
  exposure?: number;
  mapType?: string | null;
}>;

export function ToneMapping({
  exposure = 1.0,
  mapType = null,
}: ToneMappingParams) {
  const { gl } = useThree();

  const { toneMappingExposure, toneMapping } = useControls('Tone Mapping', {
    toneMapping: {
      value: mapType || 'None',
      options: Object.keys(TONE_MAPPING_OPTIONS),
    },
    toneMappingExposure: exposure,
  });

  useEffect(() => {
    gl.toneMappingExposure = toneMappingExposure;
  }, [toneMappingExposure]);

  useEffect(() => {
    gl.toneMapping = TONE_MAPPING_OPTIONS[toneMapping];
  }, [toneMapping]);

  return <></>;
}
