import { MutableRefObject, ReactNode } from 'react';

export type VuerProps<P = unknown, E = undefined> = P & {
  _key?: string;
  _ref?: MutableRefObject<E>;
  children?: ReactNode | undefined
  [key: string]: unknown;
};

export interface EventType {
  etype: string;
}

export interface ClientEvent extends EventType {
  key?: string;
  value?: string | number | number[] | unknown | Record<string, unknown>;
}

export interface ServerEvent extends EventType {
  data: string | number | number[] | unknown | Record<string, unknown>;
}