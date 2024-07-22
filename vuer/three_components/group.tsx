import { PropsWithChildren, useContext, useEffect, useMemo, } from 'react';
import { useControls } from 'leva';
import queryString, { ParsedQuery } from 'query-string';
import { Euler, Vector3 } from '@react-three/fiber';
import { document } from '../third_party/browser-monads';
import { Sim3, SO3, V3 } from './number_types';
import { useSocket } from "../vuer/websocket";
import { ClientEvent } from "../vuer/interfaces";
import { SceneStoreType, useSceneStore } from "../vuer";

export function deg2rad(rotation: SO3): SO3 {
  return {
    x: (rotation.x * Math.PI) / 180,
    y: (rotation.y * Math.PI) / 180,
    z: (rotation.z * Math.PI) / 180,
    order: rotation.order || 'XYZ',
  } as SO3;
}

export function rad2deg(rotation: SO3): SO3 {
  return {
    x: (rotation.x * 180) / Math.PI,
    y: (rotation.y * 180) / Math.PI,
    z: (rotation.z * 180) / Math.PI,
    order: rotation.order || 'XYZ',
  } as SO3;
}

export const v3array = ({ x, y, z }: V3): [ number, number, number ] => [ x, y, z ];
export const euler2array = ({
  x, y, z, order = undefined,
}: SO3): Euler => {
  if (typeof order === 'undefined') return [ x, y, z ] as Euler;
  return [ x, y, z, order ] as Euler;
};
export const rot2array = (rotation: SO3): Euler => euler2array(deg2rad(rotation));

export const scale2array = (scale: number | [ number, number, number ] | V3): Vector3 => {
  if (typeof scale === 'number') return [ scale, scale, scale ] as Vector3;
  return v3array(scale as V3) as Vector3;
};

type SceneGroupProps = PropsWithChildren<{
  levaPrefix?: string;
  position?: V3;
  rotation?: V3;
  scale?: number;
}>;

interface Sim3Queries {
  rotation?: string;
  position?: string;
  scale?: string;
}

/**
 * SceneGroup component
 *
 * @param levaPrefix - The prefix for the leva controls
 * @param position - The initial position of the scene
 * @param rotation - The initial rotation of the scene
 * @param scale - The initial scale of the scene
 * */
export function SceneGroup({
  levaPrefix = 'Scene.World Transform',
  position: paramPosition,
  rotation: paramRotation,
  scale: paramScale,
  children,
}: SceneGroupProps) {
  const { uplink } = useSocket();
  const sceneStore = useSceneStore();
  const queries = useMemo<Sim3>((): Sim3 => {
    const q: ParsedQuery & Sim3Queries = queryString.parse(document.location.search);

    let rotation;
    let position;
    let scale;

    if (q.rotation) {
      const [ x, y, z ] = q.rotation.split(',').filter((u) => u && u === u).map(parseFloat);
      rotation = { x, y, z };
    }
    if (q.position) {
      const [ x, y, z ] = q.position.split(',').filter((u) => u && u === u).map(parseFloat);
      position = { x, y, z };
    }
    if (q.scale) {
      scale = parseFloat(q.scale);
    }

    return { rotation, position, scale } as Sim3;
  }, []);

  const { position, rotation, scale } = useControls(
    levaPrefix,
    {
      rotation: {
        value: paramRotation || queries.rotation || { x: 0, y: 0, z: 0 },
        order: 1,
        lock: true,
      },
      position: {
        value: paramPosition || queries.position || { x: 0, y: 0, z: 0 },
        order: -1,
        lock: true,
      },
      scale: {
        value: paramScale || queries.scale || 1,
        min: 0.0001,
        step: 0.01,
        label: 'Scale',
        order: 2,
        pad: 4,
      },
    },
    { collapsed: false },
  );

  // here we register a reducer for "CAMERA_MOVE" events. This will trigger
  // a camera update event in the _camera.js component.
  useEffect(() => {
    // emit the event in a timeout, so it happens after the addReducer synchronous call.
    setTimeout(() => uplink?.publish({ etype: 'CAMERA_UPDATE' } as ClientEvent), 0);

    // update the scene store.
    sceneStore.update({ position, rotation, scale } as SceneStoreType);

    return uplink.addReducer('CAMERA_MOVE', (event: ClientEvent<{ world: number[] }>): ClientEvent => ({
      ...event,
      value: {
        ...(event.value as object),
        world: {
          ...(event.value?.world as object),
          position,
          rotation, // : deg2rad(rotation),
          scale,
        },
      },
    } as ClientEvent));
  }, [ uplink, position, rotation, scale ]);
  return (
    <group
      position={v3array(position) as Vector3 || [ 0, 0, 0 ]}
      rotation={rot2array(rotation) || [ 0, 0, 0 ]}
      scale={scale2array(scale || 1.0)}
    >
      {children}
    </group>
  );
}

export function GroupSlave({ children }: PropsWithChildren) {
  const { position, rotation, scale } = useSceneStore() as Sim3;
  return (
    <group
      position={v3array(position) as Vector3 || [ 0, 0, 0 ]}
      rotation={rot2array(rotation) || [ 0, 0, 0 ]}
      scale={scale2array(scale || 1.0)}
    >
      {children}
    </group>
  );
}
