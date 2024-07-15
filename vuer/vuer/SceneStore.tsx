import  create from 'zustand';
import { Euler, Vector3 } from '@react-three/fiber';

export interface SceneStoreType {
  position: Vector3;
  rotation: Euler;
  scale: number[] | Vector3;
  update: (value: object) => void;
}

// export const SceneContext = React.createContext("Scene");
export const useSceneStore = create<SceneStoreType>((set) => ({
  position: [ 0, 0, 0 ],
  rotation: [ 0, 0, 0, 'XYZ' ],
  scale: [ 1, 1, 1 ],
  update: (value: object) => { set((state: object) => ({ ...state, ...value })); },
}));
