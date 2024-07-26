import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { MeshProps } from '@react-three/fiber';
import { half2float } from './half2float';
import { BufferAttribute, RepeatWrapping, TextureLoader } from 'three';

enum Side {
  front,
  back,
  double,
}

type MaterialArgs = {
  mapRepeat?: [number, number];
  [key: string]: unknown;
};

type TriMeshProps = MeshProps & {
  vertices: Uint16Array;
  faces: Uint16Array;
  colors?: Uint8Array;
  color?: string;
  uv?: Uint16Array;
  materialType?:
    | 'basic'
    | 'standard'
    | 'phong'
    | 'lambert'
    | 'normal'
    | 'depth';
  wireframe?: boolean;
  opacity?: number;
  side?: 'front' | 'back' | 'double';
  material?: MaterialArgs;
};

type GeoCache = {
  vertices: Float32Array;
  faces: Uint32Array;
  colors?: Float32Array;
  uv?: Float32Array;
};

export function TriMesh({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  vertices,
  faces,
  colors,
  color,
  uv,
  materialType = 'standard',
  wireframe,
  opacity,
  side = 'double',
  material,
  ...rest
}: TriMeshProps) {
  const geometry = useMemo<GeoCache>(() => {
    const byteRatio =
      Uint8Array.BYTES_PER_ELEMENT / Float32Array.BYTES_PER_ELEMENT;
    return {
      vertices: half2float(vertices),
      faces: new Uint32Array(
        faces.buffer.slice(faces.byteOffset),
        0,
        byteRatio * faces.byteLength,
      ),
      colors: colors && Float32Array.from(colors, (octet) => octet / 0xff),
      uv: uv && half2float(uv),
    };
  }, [vertices, faces, colors, uv]);

  const [materialParams, setMaterial] = useState({});
  const [textures, setTexture] = useState({});
  const loader = useMemo(() => new TextureLoader(), []);
  const meshRef = useRef();
  const updateRef = useRef(false);

  const materialParamValues = material ? Object.values(material) : [];

  useLayoutEffect(() => {
    for (const k in material) {
      const value = material[k];
      const isMap = k.endsWith('map') || k.endsWith('Map');
      if (typeof value === 'string' && isMap) {
        loader &&
          loader.load(value, (newTexture) => {
            const repeat = material[`${k}Repeat`] as [number, number];
            if (!!repeat) {
              newTexture.wrapS = newTexture.wrapT = RepeatWrapping;
              newTexture.repeat.set(...repeat);
            }
            setTexture((store) => ({ ...store, [k]: newTexture }));
            updateRef.current = true;
          });
      } else {
        setMaterial((store) => ({ ...store, [k]: value }));
        // the previous update flag is set asynchronously. This is synchronous.
        updateRef.current = true;
      }
    }
  }, materialParamValues);

  if (updateRef.current) {
    updateRef.current = false;
    // @ts-ignore: geom is defined
    const matRef = meshRef?.current?.material;
    matRef && (matRef.needsUpdate = true);
  }

  useLayoutEffect(() => {
    // @ts-ignore: geom is defined
    const geom = meshRef?.current?.geometry;
    if (!geom || !geometry.uv) return;
    geom.attributes.uv = new BufferAttribute(geometry.uv, 2);
  }, [geometry.uv]);

  const MType = `mesh${materialType.charAt(0).toUpperCase()}${materialType.slice(1)}Material`;

  return (
    <mesh
      ref={meshRef}
      position={position}
      rotation={rotation}
      castShadow
      receiveShadow
      {...rest}
    >
      <bufferGeometry onUpdate={(self) => self.computeVertexNormals()}>
        <bufferAttribute
          attach='attributes-position'
          array={geometry.vertices}
          count={geometry.vertices.length / 3}
          itemSize={3}
        />
        {geometry.colors && (
          <bufferAttribute
            attach='attributes-color'
            array={geometry.colors}
            count={geometry.colors.length / 3}
            itemSize={3}
          />
        )}
        <bufferAttribute
          attach='index'
          array={geometry.faces}
          count={geometry.faces.length}
          itemSize={1}
        />
      </bufferGeometry>
      <MType
        // @ts-ignore: suppress not in intrinsic props error.
        attach='material'
        wireframe={wireframe}
        // only use vertex colors if it is provided.
        vertexColors={!!colors}
        color={color}
        transparent
        alphaTest={1}
        opacity={opacity}
        // one of [0, 1, 2]
        side={Side[side]}
        {...materialParams}
        {...textures}
      />
    </mesh>
  );
}
