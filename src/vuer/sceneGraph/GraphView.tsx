import React, { useState } from 'react';
import { Node } from '../interfaces';
import { panel, folder, item } from './panel.module.scss';
import { CubeIcon } from './icons/CubeIcon.tsx';
import { SceneOps, SceneStoreType } from '../sceneStore.tsx';
import { AddEvent } from './events.ts';
import { AddOp } from './eventHelpers.ts';
import { CylinderIcon } from './icons/CylinderIcon.tsx';
import { SphereIcon } from './icons/SphereIcon.tsx';

export const NodeItem = ({ tag, children = [] }: Node) => {
  const [open, setOpen] = useState(true);
  console.log(children);
  // if (!children || children?.length === 0) {
  //   return <div>{tag}</div>;
  // } else {
  return (
    <div className={folder} onClick={(e) => {
      e.stopPropagation();
      setOpen(!open);
    }}>
      <div className={item}>{tag}</div>
      {open && children.map((child) => (
        <NodeItem key={child.key} {...child} />
      ))}
    </div>
  );
  // }
};

function primitiveFactory(
  tag: string,
  add: (e: AddEvent) => void,
  to: string = 'children',
  rest: object = {},
) {
  const node = {
    tag,
    key: tag,
    children: [],
    ...rest,
  };
  return () => {
    add(
      AddOp([node], to),
    );
  };
}

type GraphViewProps = {
  title?: string,
  nodes?: string[] | Node[] | null
  sceneOps?: SceneOps
}
export const GraphView = (
  {
    title,
    nodes,
    sceneOps,
  }: GraphViewProps) => {
  const { add } = sceneOps;
  const [open, setOpen] = useState(true);
  return (
    <div
      className={panel}
      onClick={(e) => {
        e.stopPropagation();
        setOpen(!open);
      }}
    >
      {title && <h3>{title}</h3>}
      {open && nodes &&
        nodes?.map((node) => {
          if (typeof node === 'string') {
            return <NodeItem tag="text">{[node]}</NodeItem>;
          } else {
            return <NodeItem key={node.key} {...node} />;
          }
        })}

      {/*<button onClick={primitiveFactory('Box', add, 'children', {*/}
      {/*  materialType:"physical",*/}
      {/*  material: {*/}
      {/*    metalness: 0.1,*/}
      {/*    roughness: 0.0,*/}
      {/*  }*/}
      {/*})}><CubeIcon /></button>*/}
      {/*<button onClick={primitiveFactory('Sphere', add)}><SphereIcon /></button>*/}
      {/*<button onClick={primitiveFactory('Cylinder', add)}><CylinderIcon /></button>*/}
    </div>
  );
};