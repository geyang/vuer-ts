export function findByKey(node, key: string, attrs: string[] = [ 'children' ]) {
  if (node.key === key) return node;

  for (const attr of attrs) {
    if (node[attr]) {
      for (const child of node[attr]) {
        const result = findByKey(child, key,);
        if (result) return result;
      }
    }
  }
}

// todo: add find parent by key
// todo: remove element from parent
export function removeByKey(node, key?: string, attrs: string[] = [ 'children' ]): boolean {

  for (const attr of attrs) {
    if (node[attr]) {
      for (const child of node[attr]) {
        if (child.key === key) return node[attr];
        const index = node[attr].indexOf(child);

        if (index < 0) continue;
        node[attr].splice(index, 1);
        // return true to trigger update
        return true;
      }
    }
  }
  return false;
}

export function addNode(scene, element, parentKey?: string): true | undefined {
  if (!scene) throw ('scene is undefined');
  const parent = parentKey ? findByKey(scene, parentKey) : scene;
  if (!parent.children) parent.children = [];

  parent.children.push(element);
  // return true to trigger update
  return true;
}

/** Upsert node into the 'child' of a parent node
 *
 * */
export function upsert(node, newNodes, attr = "children"): boolean {
  if (!node[attr]) return false;

  for (const newNode of newNodes) {
    const oldNode = findByKey(node, newNode.key, [ attr ]);
    if (oldNode) Object.assign(oldNode, newNode);
    else node[attr].push(newNode);
  }
  return true;
}

export function imageToBase64(img: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsDataURL(img);
  });
}
