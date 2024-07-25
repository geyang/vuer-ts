import { MutableRefObject, ReactNode } from 'react';

export type VuerProps<P = {}, E = unknown> = P & {
  _key?: string;
  _ref?: MutableRefObject<E>;
  children?: ReactNode | undefined;
  [key: string]: unknown;
};

export interface Node {
  key?: string;
  tag: string;
  children?: Node[] | string[] | null;

  [key: string]: unknown;
}

/* @formatter:off */
/* @prettier-ignore-start */
export type Matrix16T = [
  number, number, number, number,
  number, number, number, number,
  number, number, number, number,
  number, number, number, number,
];
/* @prettier-ignore-end */
/* @formatter:on */

export type QuaternionT = [ number, number, number, number ];

export interface EventType {
  /** This is the timestamp of the event object. */
  ts: number;
  etype: string;
}

export interface ClientEvent<T = unknown | Record<string, unknown>>
  extends EventType {
  key?: string;
  value?: T;
}

export interface ServerEvent<T = unknown | Record<string, unknown>>
  extends EventType {
  data: T;
}

// server RPC requests has a uuid so that we know which respond correspond to it.
export interface ServerRPC extends ServerEvent {
  uuid: string;
  rtype: string;
}

export interface SceneType {
  up: [ number, number, number ];
  xrMode: 'AR' | 'VR' | 'hidden';
  frameloop: 'demand' | 'always';
  children: Node[];
  htmlChildren: Node[];
  rawChildren: Node[];
  bgChildren: Node[];
}

export interface SetEvent extends ServerEvent {
  data: { tag: string } & SceneType;
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
