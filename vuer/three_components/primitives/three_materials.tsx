import {
  MeshBasicMaterial,
  MeshDepthMaterial,
  MeshLambertMaterial,
  MeshNormalMaterial,
  MeshPhongMaterial,
  MeshStandardMaterial,
} from 'three';

export type MaterialTypes =
  | 'basic'
  | 'phong'
  | 'lambert'
  | 'standard'
  | 'normal'
  | 'depth';

export const ALL_MATERIALS = {
  basic: MeshBasicMaterial,
  phong: MeshPhongMaterial,
  lambert: MeshLambertMaterial,
  standard: MeshStandardMaterial,
  normal: MeshNormalMaterial,
  depth: MeshDepthMaterial,
};