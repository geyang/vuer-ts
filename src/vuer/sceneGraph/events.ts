import { ChildrenKey, Node, ServerEvent, Partial } from '../interfaces.tsx';
import { Euler, Vector3 } from '@react-three/fiber';

export type SceneChildrenKey = ChildrenKey | 'htmlChildren' | 'rawChildren' | 'bgChildren';

export interface SceneType
  extends Partial<SceneChildrenKey, Node[] | string[] | null> {

  position?: Vector3;
  rotation?: Euler;
  scale?: number[] | Vector3;
  up?: [number, number, number] | null;

  xrMode?: 'AR' | 'VR' | 'hidden';
  frameloop?: 'demand' | 'always';
}

// the key needs to be removed explicitly.
export interface SetEvent extends ServerEvent {
  data: { key?: string, tag: string } & SceneType;
}

export interface AddEvent extends ServerEvent {
  data: { nodes: Node[]; to: string };
}

export interface UpdateEvent extends ServerEvent {
  data: { nodes: Node[] };
}

export interface UpsertEvent extends ServerEvent {
  data: { nodes: Node[]; to: string };
}

export interface RemoveEvent extends ServerEvent {
  data: { keys: string[] };
}