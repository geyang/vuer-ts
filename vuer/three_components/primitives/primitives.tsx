import React, { Ref, useLayoutEffect, useRef } from 'react';
import { Mesh, RepeatWrapping, Texture, TextureLoader } from 'three';
import { useLoader } from '@react-three/fiber';
import { HeightMaterial } from './height_map_materials';
import { Outlines } from '@react-three/drei';
import { MaterialTypes } from './three_materials';

type MaterialProps = {
  map?: string | string[];
  mapRepeat?: [number, number];
  normalMap?: string | string[];
  displacementMap?: string | string[];
  [key: string]: unknown;
};

type PrimitiveProps = {
  _ref?: Ref<Mesh>;
  _key?: string;
  sendMsg?;
  children?;
  hide?: boolean;
  args?: number[];
  material?: MaterialProps;
  materialType?: MaterialTypes;
  outlines?;
  [key: string]: unknown;
};

export function Primitive({
  _ref,
  _key = 'Box',
  geometry: Geometry,
  // todo: can use children to enable multiple materials.
  // children,
  hide,
  args,
  materialType = 'basic', // One of ["basic", "standard", "phong", "standard", "lambert"]
  material: { map, mapRepeat, displacementMap, normalMap, ..._material } = {},
  outlines,
  ...rest
}: { geometry: string } & PrimitiveProps) {
  const localRef = useRef();
  const ref = _ref || localRef;

  const materialKeys = Object.keys(_material).join(',');

  const materialKeyRef = useRef(1);
  useLayoutEffect(() => {
    materialKeyRef.current += 1;
  }, [materialType, materialKeys]);

  const texture = useLoader(TextureLoader, map || []) as Texture;
  if (map && !!mapRepeat) {
    texture.wrapS = texture.wrapT = RepeatWrapping;
    texture.repeat.set(...mapRepeat);
  }

  // todo: use hide as a higher-level component, to avoid running all of the hooks.
  if (hide) return null;

  return (
    // @ts-ignore: todo: fix typing
    <mesh ref={ref} key={_key} {...rest}>
      {/* @ts-ignore: todo: fix typing*/}
      <Geometry attach='geometry' args={args} />
      <HeightMaterial
        // key={`${materialKeyRef.current}`}
        _key={`${materialKeyRef.current}`}
        type={materialType}
        displacementMap={displacementMap}
        normalMap={normalMap}
        normalScale={[1, 1]}
        displacementScale={1}
        map={map && texture}
        {..._material}
      />
      {outlines ? <Outlines {...outlines} /> : null}
    </mesh>
  );
}

export function Box(params: PrimitiveProps) {
  return <Primitive geometry='boxGeometry' {...params} />;
}

export function Capsule(params: PrimitiveProps) {
  return <Primitive geometry='capsuleGeometry' {...params} />;
}

export function Circle(params: PrimitiveProps) {
  return <Primitive geometry='circleGeometry' {...params} />;
}

export function Cone(params: PrimitiveProps) {
  return <Primitive geometry='coneGeometry' {...params} />;
}

export function Cylinder(params: PrimitiveProps) {
  return <Primitive geometry='cylinderGeometry' {...params} />;
}

export function Dodecahedron(params: PrimitiveProps) {
  return <Primitive geometry='dodecahedronGeometry' {...params} />;
}

export function Edges(params: PrimitiveProps) {
  return <Primitive geometry='edgesGeometry' {...params} />;
}

export function Extrude(params: PrimitiveProps) {
  return <Primitive geometry='extrudeGeometry' {...params} />;
}

export function Icosahedron(params: PrimitiveProps) {
  return <Primitive geometry='icosahedronGeometry' {...params} />;
}

export function Lathe(params: PrimitiveProps) {
  return <Primitive geometry='latheGeometry' {...params} />;
}

export function Octahedron(params: PrimitiveProps) {
  return <Primitive geometry='octahedronGeometry' {...params} />;
}

export function Plane(params: PrimitiveProps) {
  return <Primitive geometry='planeGeometry' {...params} />;
}

export function Polyhedron(params: PrimitiveProps) {
  return <Primitive geometry='polyhedronGeometry' {...params} />;
}

export function Ring(params: PrimitiveProps) {
  return <Primitive geometry='ringGeometry' {...params} />;
}

export function Shape(params: PrimitiveProps) {
  return <Primitive geometry='shapeGeometry' {...params} />;
}

export function Sphere(params: PrimitiveProps) {
  return <Primitive geometry={'sphereGeometry'} {...params} />;
}

export function Tetrahedron(params: PrimitiveProps) {
  return <Primitive geometry='tetrahedronGeometry' {...params} />;
}

export function Torus(params: PrimitiveProps) {
  return <Primitive geometry='torusGeometry' {...params} />;
}

export function TorusKnot(params: PrimitiveProps) {
  return <Primitive geometry='torusKnotGeometry' {...params} />;
}

export function Tube(params: PrimitiveProps) {
  return <Primitive geometry='tubeGeometry' {...params} />;
}

export function Wireframe(params: PrimitiveProps) {
  return <Primitive geometry='wireframeGeometry' {...params} />;
}
