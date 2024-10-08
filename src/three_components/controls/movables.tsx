import {
  ForwardedRef,
  forwardRef,
  MutableRefObject,
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Euler, Group, Matrix4, Mesh, Quaternion, Vector3 } from 'three';
import { MeshProps, Vector3 as rVector3 } from '@react-three/fiber';
import { PivotControls } from '@react-three/drei';
import { useXR } from '@react-three/xr';
import { SqueezeRayGrab } from './utils';
import { SocketContextType, useSocket } from '../../vuer/websocket';
import { ClientEvent, VuerProps } from '../../vuer/interfaces';

export const HandleBox = forwardRef(
  (
    {
      size,
      children,
      opacity = 1.0,
      ...rest
    }: MeshProps &
      PropsWithChildren<{
        size: [number, number, number];
        opacity?: number;
      }>,
    ref: ForwardedRef<Mesh>,
  ) => (
    <mesh ref={ref} {...rest}>
      <boxGeometry args={size} />
      <meshPhongMaterial
        opacity={opacity}
        transparent={opacity < 1}
        color={0xfffff7}
      />
      {children}
    </mesh>
  ),
);

type Sim3Type = {
  position: Vector3;
  rotation: Euler;
  quaternion: Quaternion;
  scale: Vector3;
};

type MoveHandleInputType = {
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
  matrixWorld?: [
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
  rotation?: [number, number, number]; // (EulerOrder | undefined) ];
  quaternion?: [number, number, number, number];
};

type PivotProps = VuerProps<
  {
    anchor?: [number, number, number];
    offset?: [number, number, number];
    scale?: number;
    lineWidth?: number;
    onMove?: (event: MoveHandleInputType) => void;
    onMoveEnd?: (event: MoveHandleInputType) => void;
  } & MoveHandleInputType
>;

export function Pivot({
  children,
  _key,
  _ref,
  anchor,
  offset,
  scale = 0.4,
  lineWidth = 1.0,
  matrix,
  position,
  rotation,
  onMove,
  onMoveEnd,
  ...rest
}: PivotProps) {
  const [state, setState] = useState({});
  const ref = useRef();
  const localRef = (_ref || ref) as MutableRefObject<Group | Mesh>;
  const { sendMsg } = useSocket() as SocketContextType;

  const cache = useMemo<Sim3Type>(
    () => ({
      position: new Vector3(
        ...((position || [0, 0, 0]) as [number, number, number]),
      ),
      rotation: new Euler(
        ...((rotation || [0, 0, 0]) as [number, number, number]),
      ), //, (EulerOrder) ]),
      quaternion: new Quaternion(),
      scale: new Vector3(),
    }),
    [],
  );

  useEffect(() => {
    if (!localRef.current) return;
    const pivot = localRef.current;
    if (!matrix) return;
    pivot.matrix.fromArray(matrix);
    pivot.matrix.decompose(pivot.position, pivot.quaternion, pivot.scale);
    pivot.rotation.setFromQuaternion(pivot.quaternion);
  }, [matrix, localRef.current]);

  useEffect(() => {
    if (!localRef.current) return;
    const pivot = localRef.current;
    if (!!matrix) return;
    let dirty = false;
    if (!!position) {
      pivot.position.fromArray(position);
      dirty = true;
    }
    if (!!rotation) {
      pivot.rotation.fromArray(rotation);
      dirty = true;
    }
    if (dirty) pivot?.updateMatrix();
  }, [position, rotation, localRef.current]);

  function onDrag(
    local: Matrix4,
    // @ts-ignore: not used

    dLocal: Matrix4,
    world: Matrix4,
    // @ts-ignore: not used

    dWorld: Matrix4,
  ): void {
    local.decompose(cache.position, cache.quaternion, cache.scale);
    cache.rotation.setFromQuaternion(cache.quaternion);

    const newState = {
      matrix: local.toArray(),
      matrixWorld: world.toArray(),
      position: cache.position.toArray(),
      rotation: cache.rotation.toArray(),
      quaternion: cache.quaternion.toArray(),
    } as MoveHandleInputType;

    sendMsg({
      ts: Date.now(),
      etype: 'OBJECT_MOVE',
      key: _key,
      value: newState,
    } as ClientEvent);
    onMove && onMove(newState);
    setState(newState);
  }

  function onDragEnd() {
    sendMsg({
      ts: Date.now(),
      etype: 'OBJECT_MOVE_END',
      key: _key,
      value: state,
    } as ClientEvent);
  }

  return (
    <PivotControls
      // @ts-ignore: ref type mismatch
      ref={localRef}
      anchor={anchor}
      // annotations={annotations}
      offset={offset}
      scale={scale}
      onDrag={onDrag}
      onDragEnd={onDragEnd}
      lineWidth={lineWidth}
      {...rest}
    >
      {children}
    </PivotControls>
  );
}

function addThree(
  [x1, y1, z1]: [number, number, number] = [0, 0, 0],
  [x2, y2, z2]: [number, number, number] = [0, 0, 0],
): [number, number, number] {
  return [x1 + x2, y1 + y2, z1 + z2];
}

type PivotXRProps = VuerProps<{
  offset?: [number, number, number];
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  onMove?: (event: MoveHandleInputType) => void;
  onMoveEnd?: (event: MoveHandleInputType) => void;
}>;

export function PivotXR({
  _key,
  _ref,
  offset,
  scale,
  position,
  rotation,
  children = [],
  onMove,
  onMoveEnd,
}: PivotXRProps) {
  // const cloud_ref = useRef(children.length && children[0], children);
  const ref = useRef();
  const localRef = (_ref || ref) as MutableRefObject<Mesh>;

  const { sendMsg } = useSocket() as SocketContextType;

  // make memo for position and rotation
  const cache = useMemo<Sim3Type>(
    () => ({
      position: new Vector3(),
      rotation: new Euler(),
      quaternion: new Quaternion(),
      scale: new Vector3(),
    }),
    [],
  );

  const onSqueezeEnd = useCallback(() => {
    const local = localRef.current?.matrix;
    const world = localRef.current?.matrixWorld;
    world.decompose(cache.position, cache.quaternion, cache.scale);
    // convert cache.rotation quaternion to euler
    cache.rotation.setFromQuaternion(cache.quaternion);
    const state = {
      // fixme: this is surely wrong.
      matrix: local.toArray(),
      matrixWorld: world.toArray(),
      position: cache.position.toArray(),
      rotation: cache.rotation.toArray(),
      quaternion: cache.quaternion.toArray(),
    } as MoveHandleInputType;
    onMoveEnd && onMoveEnd(state);
    sendMsg({
      ts: Date.now(),
      etype: 'OBJECT_MOVE_END',
      key: _key,
      value: state,
    } as ClientEvent);
  }, []);

  const onMoveHandle = useCallback(({ local, world }) => {
    world.decompose(cache.position, cache.quaternion, cache.scale);
    // convert cache.rotation quaternion to euler
    cache.rotation.setFromQuaternion(cache.quaternion);
    const state = {
      matrix: local.toArray(),
      matrixWorld: world.toArray(),
      position: cache.position.toArray(),
      rotation: cache.rotation.toArray(),
      quaternion: cache.quaternion.toArray(),
    } as MoveHandleInputType;
    onMove && onMove(state);
    sendMsg({
      ts: Date.now(),
      etype: 'OBJECT_MOVE',
      key: _key,
      value: state,
    } as ClientEvent);
  }, []);

  const render = () => (
    <group position={position} rotation={rotation}>
      {children}
    </group>
  );

  return (
    <SqueezeRayGrab
      onSqueezeEnd={onSqueezeEnd}
      onMove={onMoveHandle}
      position={position}
      rotation={rotation}
      bgChildren={render()}
    >
      <HandleBox
        ref={localRef}
        size={[scale, scale, scale]}
        opacity={0.5}
        rotation={rotation}
        position={addThree(position, offset) as rVector3}
      />
    </SqueezeRayGrab>
  );
}

type MovableType = VuerProps<
  {
    anchor?: [number, number, number];
    offset?: [number, number, number];
    annotations?: string[];
    scale?: number;
    lineWidth?: number;
    handleOffset?: [number, number, number];
    hide?: boolean;
  } & PivotXRProps &
    PivotProps,
  Group | Mesh
>;

export function Movable({
  _key,
  _ref,
  children,
  anchor,
  offset,
  annotations,
  scale = 0.4,
  lineWidth = 2,
  handleOffset = [0, 0, 0],
  hide,
  ...props
}: MovableType) {
  // hide movable leads to pass-through
  //const xrState = useXR();
  const { isPresenting } = useXR();
  // emulate the isPresenting flag of v5
  // const isPresenting = xrState.mode !== 'inline';

  if (hide) return <>{children}</>;
  if (isPresenting) {
    return (
      <PivotXR
        _key={_key}
        _ref={_ref}
        scale={scale * 0.1}
        offset={handleOffset}
        {...props}
      >
        {children}
      </PivotXR>
    );
  }
  return (
    <Pivot
      _key={_key}
      _ref={_ref}
      anchor={anchor}
      offset={offset}
      annotations={annotations}
      scale={scale}
      lineWidth={lineWidth}
      {...props}
    >
      {children}
    </Pivot>
  );
}
