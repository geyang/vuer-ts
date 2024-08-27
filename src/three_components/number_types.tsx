export type V3 = {
  x: number,
  y: number,
  z: number
};

export type Sim3 = {
  position: V3;
  rotation: V3;
  scale: number;
};

// todo: need to handle the order of the rotation.
export type SO3 = {
  x: number;
  y: number;
  z: number;
  order?: string;
};
