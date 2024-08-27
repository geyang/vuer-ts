import create from 'zustand';
import { AddEvent, RemoveEvent, SceneType, SetEvent, UpdateEvent, UpsertEvent } from './sceneGraph/events.ts';
import { addNode, findByKey, removeByKey, upsert } from './sceneGraph';
import { Node } from './interfaces.tsx';

export interface SceneOps {
  rawUpdate: (value: object) => void;
  set: (event: SetEvent) => void;
  add: (event: AddEvent) => void;
  update: (event: UpdateEvent) => void;
  upsert: (event: UpsertEvent) => void;
  removeByKey: (event: RemoveEvent) => void;
}
export interface SceneStoreType extends Omit<SceneType, 'tag'> {
  ops: SceneOps
}

const SceneAttrs = ['children', 'rawChildren', 'htmlChildren', 'bgChildren'];

export const useSceneStore = create<SceneStoreType>((set, get) => ({
  position: [0, 0, 0],
  rotation: [0, 0, 0, 'XYZ'],
  scale: [1, 1, 1],
  up: [0, 1, 0],

  children: [],
  bgChildren: [],
  htmlChildren: [],
  rawChildren: [],

  xrMode: 'VR',
  frameloop: 'demand',

  ops: {
    rawUpdate(value: object) {
      set((state: object) => ({ ...state, ...value }));
    },
    set({ ts, etype, data }: SetEvent) {
      // console.log('set', data);
      // the top level is a dummy node. Remove key.
      delete data.key;

      if (data.tag !== 'Scene') console.error(`
        The top level node of the SET operation must be a <Scene/> object, 
        got <${data.tag}/> instead.
      `);

      set(data as SceneType);
    },
    /**
     * the API need to be updated, so are the rest of the API.
     * */
    add({ ts, etype, data: { nodes, to } }: AddEvent) {
      // console.log('add', nodes, to);
      set((prev) => {
        let dirty: boolean;
        const parentKey = to || 'children';
        for (const node of nodes) {
          try {
            const hasAdded = addNode(prev as unknown as Node, node, parentKey);
            dirty = dirty || hasAdded;
          } catch (e) {
            console.error(`Failed to add node ${node.key} to ${parentKey}. ${e}`);
          }
        }
        if (dirty) return ({ ...prev });
        else return prev;
      });
    },
    /**
     * this is the find and update.
     * */
    update({ ts, etype, data: { nodes } }: UpdateEvent) {
      // console.log('update', nodes);
      set((prev) => {
        let dirty: boolean;
        for (const { key, ...props } of nodes) {
          const node = findByKey(prev as unknown as Node, key, SceneAttrs);
          if (node) {
            Object.assign(node, props);
            dirty = true;
          } else {
            console.log('node not found', key, prev);
          }
        }
        // nested child updates do not trigger re-render.
        if (dirty) return ({ ...prev });
        else return prev;
      });
    },
    /**
     *  this is the find and update, or add if not found..
     *  */
    upsert({ ts, etype, data: { nodes, to } }: UpsertEvent) {
      // console.log('upsert', nodes, to);
      set((prev) => {
        let dirty: boolean;
        const parentKey = to || 'children';

        if (SceneAttrs.indexOf(parentKey) > -1) {
          dirty = upsert(prev as unknown as Node, nodes, parentKey);
        } else {
          const parent = findByKey(prev as unknown as Node, parentKey, SceneAttrs);
          if (!parent) return console.error(`Failed to find parent ${parentKey}`);
          dirty = upsert(parent, nodes, 'children');
        }
        // nested child updates do not trigger re-render.
        if (dirty) return ({ ...prev });
        else return prev;
      });
    },
    removeByKey({ ts, etype, data: { keys } }: RemoveEvent) {
      // console.log('remove', keys);
      set((prev) => {
        let dirty: boolean;
        for (const key of keys) {
          const removed = removeByKey(prev as unknown as Node, key);
          dirty = dirty || !!removed;
        }
        // nested child updates do not trigger re-render.
        if (dirty) return ({ ...prev });
        else return prev;
      });
    },
  },

}));

