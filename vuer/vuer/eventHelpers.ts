import {
  SetEvent,
  AddEvent,
  UpdateEvent,
  UpsertEvent,
  RemoveEvent,
  SceneType,
} from './interfaces';
import { Node } from './interfaces';

export const SetOp = (
  scene: { tag: string } & SceneType,
  ts?: number,
): SetEvent => {
  return {
    ts: ts || Date.now(),
    etype: 'SET',
    data: scene,
  };
};

export const AddOp = (
  nodes: Node[],
  to: string = 'children',
  ts?: number,
): AddEvent => {
  return {
    ts: ts || Date.now(),
    etype: 'ADD',
    data: {
      nodes,
      to,
    },
  };
};
export const UpdateOp = (nodes: Node[], ts?: number): UpdateEvent => {
  return {
    ts: ts || Date.now(),
    etype: 'UPDATE',
    data: {
      nodes,
    },
  };
};

export const UpsertOp = (
  nodes: Node[],
  to: string = 'children',
  ts?: number,
): UpsertEvent => {
  return {
    ts: ts || Date.now(),
    etype: 'UPSERT',
    data: {
      nodes,
      to,
    },
  };
};

export const RemoveOp = (keys: string[], ts?: number): RemoveEvent => {
  return {
    ts: ts || Date.now(),
    etype: 'REMOVE',
    data: {
      keys,
    },
  };
};
