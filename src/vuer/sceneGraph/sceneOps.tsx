import {
  SceneChildrenKey,
  SceneType,
} from './events.ts';
import { ChildrenKey, Node } from '../interfaces.tsx';

export function findByKey(node: Node, key: string, attrs: string[] = ['children']) {
  if (node.key === key) return node;

  for (const attr of attrs) {
    if (node[attr]) {
      for (const child of node[attr] as Node[]) {
        const result = findByKey(child as Node, key);
        if (result) return result;
      }
    }
  }
}

// todo: add find parent by key
// todo: remove element from parent
export function removeByKey(
  node: Node | SceneType,
  key?: string,
  attrs: ChildrenKey[] | SceneChildrenKey[] = ['children'],
): boolean | Node[] {

  for (const attr of attrs) {
    if (!node[attr]) continue;
    for (const child of node[attr] as Node[]) {
      if (child.key === key) return node[attr] as Node[];
      // this should never get triggered.
      // const index = node[attr].indexOf(child);
      // console.warn('removeByKey Deprecation Error: index', index, 'should never be triggered.');
      //
      // if (index < 0) continue;
      // node[attr].splice(index, 1);
      /** trigger update */
      return true;
    }
  }
  return false;
}

export function addNode(scene: Node, element: Node, parentKey?: string): true | undefined {
  if (!scene) throw ('scene is undefined');
  if (parentKey in scene && Array.isArray(scene[parentKey])) {
    scene[parentKey].push(element);
    return true;
  } else {
    const parent = parentKey ? findByKey(scene, parentKey) : scene;
    if (!parent.children) parent.children = [];

    parent.children.push(element);
    // return true to trigger update
    return true;
  }

}

/**
 * Upsert node into the 'child' of a parent node
 * */
export function upsert(node: Node, newNodes: Node[], attr = 'children'): boolean {
  if (!node[attr]) return false;

  for (const newNode of newNodes) {
    const oldNode = findByKey(node, newNode.key, [attr]);
    if (oldNode) Object.assign(oldNode, newNode);
    // ts-ignore: assume node.children always an array
    else (node[attr] as Node[]).push(newNode);
  }
  return true;
}