import React, { useLayoutEffect, useMemo, useRef } from 'react';
import {
  Color,
  Euler,
  Group,
  InstancedMesh,
  Object3D,
  Quaternion,
  Vector3,
} from 'three';
import { VuerGroup } from './better_group';

const instances = [
  {
    position: new Vector3(1, 0, 0),
    rotation: new Euler(0, 0, -0.5 * Math.PI),
    color: new Color(0xff0000),
  },
  {
    position: new Vector3(0, 1, 0),
    rotation: new Euler(0, 0, 0),
    color: new Color(0x00ff00),
  },
  {
    position: new Vector3(0, 0, 1),
    rotation: new Euler(0.5 * Math.PI, 0, 0),
    color: new Color(0x0000ff),
  },
];

export type ArrowProps = {
  matrix?: [
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
  ];
  position?: [number, number, number];
  rotation?: [number, number, number];
  direction?: [number, number, number];
  scale?: number;
  lod?: number;
  headScale?: number;
  color?: string | Color;
  opacity?: number;
  wireframe?: boolean;
};

export function Arrow({
  matrix,
  position,
  rotation,
  // todo: use direction vector instead.
  direction = [1, 0, 0],
  scale = 1.0,
  headScale = 1.0,
  lod = 10,
  color = 'red',
  opacity = 1.0,
  wireframe = false,
}: ArrowProps) {
  const ref = useRef<Group>();
  const coneRef = useRef<InstancedMesh>();
  const cylinderRef = useRef<InstancedMesh>();

  const color3 = useMemo(() => new Color(color), [color]);

  const obj = useMemo(() => new Object3D(), []);
  const dir = useMemo(() => new Vector3(...direction), [direction]);
  // the default up for cones and cylinders is Y. We need to rotate the arrow to point in the right direction.
  const quat = useMemo(
    () =>
      new Quaternion().setFromUnitVectors(
        new Vector3(0, 1, 0),
        dir.clone().normalize(),
      ),
    [dir],
  );

  /** these are local within the coords legend. Do NOT need to be recomputed.*/
  useLayoutEffect(() => {
    const coneIMesh = coneRef.current;
    if (!!coneIMesh) {
      obj.position.set(direction[0], direction[1], direction[2]);
      obj.rotation.setFromQuaternion(quat);
      obj.updateMatrix();

      coneIMesh.setMatrixAt(0, obj.matrix);
    }

    const cylinderIMesh = cylinderRef.current;
    if (!!cylinderIMesh) {
      obj.position
        .set(direction[0], direction[1], direction[2])
        .multiplyScalar(0.5);
      obj.rotation.setFromQuaternion(quat);
      obj.updateMatrix();

      cylinderIMesh.setMatrixAt(0, obj.matrix);
    }
  }, []);

  // not sure if this is needed given that we are using materials.
  useLayoutEffect(() => {
    coneRef.current?.setColorAt(0, color3);
    cylinderRef.current?.setColorAt(0, color3);
  }, [color3]);

  const mat = {};
  if (opacity == 0 || opacity < 1) {
    mat['transparent'] = true;
    mat['opacity'] = opacity;
  }

  const material = wireframe ? (
    <meshStandardMaterial wireframe {...mat} />
  ) : (
    <meshBasicMaterial {...mat} />
  );

  return (
    <VuerGroup
      ref={ref}
      position={position}
      rotation={rotation}
      scale={scale}
      matrix={matrix}
    >
      <instancedMesh ref={coneRef} args={[null, null, 1]}>
        <coneGeometry args={[0.05 * headScale, 0.1 * headScale, lod, lod]} />
        {material}
      </instancedMesh>
      <instancedMesh ref={cylinderRef} args={[null, null, 1]}>
        <cylinderGeometry args={[0.025, 0.025, dir.length(), lod, lod]} />
        {material}
      </instancedMesh>
    </VuerGroup>
  );
}

export type CoordsMarkerProps = {
  matrix?: [
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
  ];
  position?: [number, number, number];
  rotation?: [number, number, number];
  direction?: [number, number, number];
  scale?: number;
  lod?: number;
  headScale?: number;
  color?: string | Color;
  opacity?: number;
  wireframe?: boolean;
};

export function CoordsMarker({
  matrix,
  position,
  rotation,
  scale = 1.0,
  headScale = 1.0,
  lod = 10,
  color,
  opacity = 1.0,
  wireframe = false,
}: CoordsMarkerProps) {
  const ref = useRef<Group>();
  const coneRef = useRef<InstancedMesh>();
  const cylinderRef = useRef<InstancedMesh>();

  const color3 = useMemo(() => color && new Color(color), [color]);

  const obj = useMemo(() => new Object3D(), []);

  /** these are local within the coords legend. Do NOT need to be recomputed.*/
  useLayoutEffect(() => {
    const coneIMesh = coneRef.current;
    if (!coneIMesh) return;

    instances.forEach(({ position, rotation, color: _color }, index) => {
      obj.position.set(position.x, position.y, position.z);
      obj.rotation.set(rotation.x, rotation.y, rotation.z);
      obj.updateMatrix();
      coneIMesh.setMatrixAt(index, obj.matrix);
      coneIMesh.setColorAt(index, color3 || _color);
    });
  }, []);

  /** these are local within the coords legend. Do NOT need to be recomputed.*/
  useLayoutEffect(() => {
    const cylinderIMesh = cylinderRef.current;
    if (!cylinderIMesh) return;

    instances.forEach(({ position, rotation, color: _color }, index) => {
      obj.position.set(position.x / 2, position.y / 2, position.z / 2);
      obj.rotation.set(rotation.x, rotation.y, rotation.z);
      obj.updateMatrix();
      cylinderIMesh.setMatrixAt(index, obj.matrix);
      cylinderIMesh.setColorAt(index, color3 || _color);
    });
  }, []);

  const mat = {};
  if (opacity == 0 || opacity < 1) {
    mat['transparent'] = true;
    mat['opacity'] = opacity;
  }
  if (!!color) {
    mat['color'] = color3;
  }

  const material = wireframe ? (
    <meshStandardMaterial wireframe {...mat} />
  ) : (
    <meshBasicMaterial {...mat} />
  );

  return (
    <VuerGroup
      ref={ref}
      _ref={ref}
      position={position}
      rotation={rotation}
      scale={scale}
      matrix={matrix}
    >
      <instancedMesh ref={coneRef} args={[null, null, 3]}>
        <coneGeometry args={[0.05 * headScale, 0.1 * headScale, lod, lod]} />
        {material}
      </instancedMesh>
      <instancedMesh ref={cylinderRef} args={[null, null, 3]}>
        <cylinderGeometry args={[0.025, 0.025, 1, lod, lod]} />
        {material}
      </instancedMesh>
    </VuerGroup>
  );
}