import { MutableRefObject, ReactNode, useEffect, useLayoutEffect, useRef } from 'react';
import {
  BufferGeometry,
  Color,
  ColorRepresentation,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshBasicMaterialParameters,
  Points,
} from 'three';
import { URDFRobot } from 'urdf-loader';
import { MaterialProps, useThree } from '@react-three/fiber';
import { Matrix16T, VuerProps } from "../interfaces";
import { GLTF } from "three-stdlib";
import { ALL_MATERIALS, MaterialTypes } from "./primitives/three_materials";
import { VuerGroup, VuerGroupProps } from "./primitives/better_group";

export type PcdProps = VuerProps<{
  data?: Points;
  hide?: boolean;
  color?: string;
  matrix?: Matrix16T
}, Points>;

export function PcdView(
  {
    data, _ref, size = 0.0015, hide, matrix, ...rest
  }: PcdProps & {
    size?: number;
  },
): ReactNode | null {

  const __ref = useRef();
  const ref = (_ref || __ref) as MutableRefObject<Points>;

  useLayoutEffect(() => {
    const group = ref.current;
    if (!group) return
    if (matrix) {
      group.matrix.fromArray(matrix);
      group.matrix.decompose(group.position, group.quaternion, group.scale);
      group.rotation.setFromQuaternion(group.quaternion);
    }
  }, [ matrix, ref.current ])

  if (!data || hide) return null;
  // rest includes translation and rotation
  return (
    <points ref={ref} {...rest}>
      {/* @ts-ignore: for some reason geometry does not exist on JSX Elements. */}
      <geometry attach="geometry" {...data.geometry} />
      <pointsMaterial
        attach="material"
        vertexColors
        size={size}
        sizeAttenuation
        transparent
        alphaTest={1}
        opacity={1}
      />
    </points>
  );
}

export type ObjProps = VuerProps<{
  data?: Group;
  hide?: boolean;
  color?: string;
  matrix?: Matrix16T;
  wireframe?: boolean;
  materialType?: MaterialTypes;
  material?: MaterialProps;
}, Points>;

export function ObjView(
  {
    data, _ref, wireframe = false, color = null, matrix, material, materialType, hide, ...rest
  }: ObjProps & { wireframe?: boolean, color?: ColorRepresentation }
) {
  const __ref = useRef();
  const ref = _ref || __ref;

  useLayoutEffect(() => {
    const group = ref.current;
    if (!group) return
    if (matrix) {
      group.matrix.fromArray(matrix);
      group.matrix.decompose(group.position, group.quaternion, group.scale);
      group.rotation.setFromQuaternion(group.quaternion);
    }
  }, [ matrix, ref.current ])

  const { scene } = useThree();
  useLayoutEffect(() => {
    let mat;
    if (materialType) {
      const MatCls = ALL_MATERIALS[materialType] as typeof MeshBasicMaterial;
      mat = new MatCls({ color, ...material } as MeshBasicMaterialParameters);
    }
    data?.traverse((mesh: Mesh<BufferGeometry, MeshBasicMaterial>) => {
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      if (mat) mesh.material = mat;
      if (!mesh.material) return
      mesh.material.wireframe = wireframe;
      mesh.material.needsUpdate = true;
    })
    return () => {
      scene.remove(data)
      mat?.dispose();
    };
  }, [ data, color, wireframe, materialType, material ])


  // done: offer wireframe and color-override options.
  // todo: add key to avoid GL error during fast update
  if (!data || hide) return null;
  return (
    <primitive
      ref={ref}
      receiveShadow={true}
      castShadow={true}
      object={data}
      {...rest}
    />
  );
}

export type PlyProps = VuerProps<{
  data: BufferGeometry;
  size?: number;
  color?: ColorRepresentation
  matrix?: Matrix16T;
}, Points | Mesh>;

export function PlyView(
  {
    data,
    _ref,
    size = 0.005,
    color,
    matrix,
    hide,
    ...rest
  }: PlyProps,
) {
  // computing the normals on unordered pointcloud is bad.
  const __ref = useRef();
  const ref = _ref || __ref;
  useLayoutEffect(() => {
    const group = ref.current;
    if (!group) return
    if (matrix) {
      group.matrix.fromArray(matrix);
      group.matrix.decompose(group.position, group.quaternion, group.scale);
      group.rotation.setFromQuaternion(group.quaternion);
    }
  }, [ matrix, ref.current ])

  if (!data || hide) return null;
  if (!data.attributes.normal) console.log('data.attributes.normal is missing');
  if (data && !data.attributes.normal) {
    if (data.index) {
      console.log('compute normals for data. ')
      data.computeVertexNormals();
    } else {
      console.log("Both data.index and data.attributes.normal are missing. Won't be able to compute surface normals.");
    }
  }
  if (data.attributes.normal) {
    return (
      <mesh
        ref={ref as MutableRefObject<Mesh>}
        geometry={data}
        castShadow
        receiveShadow
        {...rest}
      >
        <meshStandardMaterial vertexColors/>
      </mesh>
    );
  }
  if (color) {
    return (
      <points
        ref={ref as MutableRefObject<Points>}
        {...rest}
      >
        <bufferGeometry {...data} />
        <pointsMaterial
          size={size}
          vertexColors
          color={color}
          sizeAttenuation
        />
      </points>
    );
  }
  return (
    <points ref={ref as MutableRefObject<Points>} geometry={data} {...rest}>
      <pointsMaterial
        attach="material"
        vertexColors
        size={size}
        sizeAttenuation
        opacity={1}
      />
    </points>
  );
}

export type GltfProps = VuerProps<{
  data: GLTF;
  matrix?: Matrix16T;
  color?: ColorRepresentation;
  materialType?: MaterialTypes;
  material?: MaterialProps;
}, Group>;

// GLB is a binary container format of GLTF.
export function GltfView({ data, _ref, matrix, color, materialType, material, ...rest }: GltfProps) {
  const { scene } = useThree();

  useLayoutEffect(() => {
    if (matrix && matrix.length === 16) {
      data.scene.matrix.fromArray(matrix);
      data.scene.matrix.decompose(data.scene.position, data.scene.quaternion, data.scene.scale);
      data.scene.rotation.setFromQuaternion(data.scene.quaternion);
    }
  }, [ data, matrix ]);

  useLayoutEffect(() => {
    if (materialType) {
      const MatCls = ALL_MATERIALS[materialType] as typeof MeshBasicMaterial;
      const mat = new MatCls({ color, ...material } as MeshBasicMaterialParameters);
      data.scene.traverse((obj: Mesh) => {
        obj.material = mat;
      });
      return () => mat.dispose();
    } else if (color) data.scene.traverse((obj: Mesh) => {
      if (obj?.isMesh) (obj.material as MeshBasicMaterial)?.color?.set(color);
    });
  }, [ data, color, materialType, material ]);

  useEffect(() => {
    return () => {
      // from: https://discourse.threejs.org/t/how-to-dispose-and-destroy-gltf-object-completely/24761
      scene.remove(data.scene);
    };
  }, [ data ]);
  return <primitive ref={_ref} object={data.scene} {...rest} />;
}


export type UrdfViewProps = VuerProps<{
  robot: URDFRobot;
  matrix: Matrix16T;
  jointValues?: { [key: string]: number };
  color?: ColorRepresentation;
  materialType?: MaterialTypes;
  material?: MaterialProps;
}, Group>

export function UrdfView(
  {
    robot, _ref, jointValues = {}, matrix,
    color
    , materialType, material,
    ...rest
  }: UrdfViewProps,
) {
  const { scene } = useThree();
  useLayoutEffect(() => {
    if (matrix && matrix.length === 16) {
      robot.matrix.fromArray(matrix);
      robot.matrix.decompose(robot.position, robot.quaternion, robot.scale);
      robot.rotation.setFromQuaternion(robot.quaternion);
    }
  }, [ robot, matrix ])

  useLayoutEffect(() => {
    if (materialType) {
      const MatCls = ALL_MATERIALS[materialType] as typeof MeshBasicMaterial;
      const mat = new MatCls({ color, ...material } as MeshBasicMaterialParameters);
      robot.traverse((obj: Mesh) => {
        obj.material = mat;
      });
      return () => mat.dispose();
    } else if (color) robot.traverse((obj: Mesh) => {
      if (obj?.isMesh) (obj.material as MeshBasicMaterial)?.color?.set(color);
    });
  }, [ robot, color, materialType, material ]);

  useEffect(
    () => {
      if (jointValues) robot?.setJointValues(jointValues);
      return () => {
        // Object.values(robot.links).forEach(dispose)
        // Object.values(robot.joints).forEach(dispose)
        // Object.values(robot.colliders).forEach(dispose)
        // Object.values(robot.visual).forEach(dispose)
        // Object.values(robot.frames).forEach(dispose)
        scene.remove(robot)
      };
    },
    [ robot, jointValues ],
  );

  return <primitive ref={_ref} object={robot} {...rest} />;
}

type GripperProps = VuerProps<{
  color?: Color;
  pinchWidth?: number;
  skeleton?: boolean;
  axes?: boolean;
  // showCoordnates?: boolean;
  showOrigin?: boolean;
  hide?: boolean;
}, typeof Group> & VuerGroupProps;

export function Gripper(
  {
    _ref,
    color,
    pinchWidth = 0.04,
    skeleton = false,
    axes = false,
    // showCoordnates = True,
    showOrigin = true,
    // up = Object3D.DEFAULT_UP,
    hide,
    ...rest
  }: GripperProps,
) {
  const __ref = useRef();
  const ref = _ref || __ref;
  if (hide) return null;
  if (skeleton) {
    return (
      <SkeletalGripper
        _ref={_ref}
        color={color}
        pinchWidth={pinchWidth}
        {...rest}
      />
    );
  }
  return (
    <VuerGroup _ref={ref} {...rest}>
      {axes && <axesHelper args={[ 0.1 ]}/>}
      <mesh
        position={[ 0, 0.07, 0 ]}
        rotation={[ 0, 0, Math.PI / 2 ]}
        scale={[ 1, 1, 1 ]}
      >
        <cylinderGeometry attach="geometry" args={[ 0.015, 0.015, 0.12, 32 ]}/>
        <meshBasicMaterial attach="material" color={color || '#cecece'}/>
      </mesh>
      <mesh position={[ -pinchWidth - 0.005, 0.0, 0.0 ]} scale={1}>
        <boxGeometry attach="geometry" args={[ 0.01, 0.02, 0.025, 32 ]}/>
        <meshBasicMaterial attach="material" color={color || '#23aaff'}/>
      </mesh>
      <mesh position={[ -pinchWidth - 0.005, 0.0275 + 0.01, 0.0 ]} scale={1}>
        <boxGeometry attach="geometry" args={[ 0.01, 0.055, 0.025, 32 ]}/>
        <meshBasicMaterial attach="material" color={color || '#8ed6ff'}/>
      </mesh>
      <mesh position={[ pinchWidth + 0.005, 0.0, 0.0 ]} scale={1}>
        <boxGeometry attach="geometry" args={[ 0.01, 0.02, 0.025, 32 ]}/>
        <meshBasicMaterial attach="material" color={color || '#ff5656'}/>
      </mesh>
      <mesh position={[ pinchWidth + 0.005, 0.0275 + 0.01, 0.0 ]} scale={1}>
        <boxGeometry attach="geometry" args={[ 0.01, 0.055, 0.025, 32 ]}/>
        <meshBasicMaterial attach="material" color={color || '#ff9595'}/>
      </mesh>
      <mesh
        position={[ 0, 0.075 + 0.025, 0 ]}
        rotation={[ 0, 0, 0 ]}
        scale={[ 1, 1, 1 ]}
      >
        <cylinderGeometry attach="geometry" args={[ 0.0125, 0.0125, 0.05, 32 ]}/>
        <meshBasicMaterial attach="material" color={color || '#5b5b5b'}/>
      </mesh>
      {/* add a sphere to show the origin */}
      {showOrigin ? (
        <mesh position={[ 0, 0, 0 ]} rotation={[ 0, 0, 0 ]}>
          <sphereGeometry attach="geometry" args={[ 0.0075, 32, 32 ]}/>
          <meshBasicMaterial attach="material" color="green"/>
        </mesh>
      ) : null}
    </VuerGroup>
  );
}


type SkeletalGripperProps = VuerProps<{
  color?: Color;
  pinchWidth?: number;
  opacity?: number;
  hide?: boolean;
}, typeof Group> & VuerGroupProps;

export function SkeletalGripper(
  {
    _ref,
    color,
    pinchWidth = 0.07,
    opacity = 0.9,
    hide,
    ...rest
  }: SkeletalGripperProps,
) {
  const __ref = useRef();
  const ref = _ref || __ref;
  if (hide) return null;
  return (
    <VuerGroup _ref={ref} scale={1} {...rest} >
      <mesh position={[ 0, 0.07, 0 ]} rotation={[ Math.PI / 2, 0, 0 ]} scale={[ 1, 1, 1 ]}>
        <cylinderGeometry attach="geometry" args={[ 0.005, 0.005, pinchWidth * 2, 32 ]}/>
        <meshBasicMaterial color={color || '#ffffff'} transparent opacity={opacity}/>
      </mesh>
      <mesh position={[ 0, 0.02, pinchWidth ]} scale={1}>
        <cylinderGeometry attach="geometry" args={[ 0.005, 0.005, 0.1, 32 ]}/>
        <meshBasicMaterial attach="material" color={color || '#23aaff'} transparent opacity={opacity}
        />
      </mesh>
      <mesh position={[ 0, 0.02, -pinchWidth ]} scale={1}>
        <cylinderGeometry attach="geometry" args={[ 0.005, 0.005, 0.1, 32 ]}/>
        <meshBasicMaterial attach="material" color={color || '#ff5656'} transparent opacity={opacity}
        />
      </mesh>
      <mesh position={[ 0, 0.09, 0 ]} rotation={[ 0, 0, 0 ]} scale={[ 0.8, 1, 1 ]}>
        <cylinderGeometry attach="geometry" args={[ 0.01, 0.01, 0.06, 32 ]}/>
        <meshBasicMaterial attach="material" color={color || 'gray'} transparent opacity={opacity}/>
      </mesh>
      <mesh position={[ 0, 0, 0 ]} rotation={[ 0, 0, 0 ]}>
        <sphereGeometry attach="geometry" args={[ 0.01, 32, 32 ]}/>
        <meshBasicMaterial attach="material" color={color || 'green'} transparent opacity={opacity}/>
      </mesh>
    </VuerGroup>
  );
}


