import React, {
  PropsWithChildren,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import queryString from 'query-string';
import { button, folder, useControls } from 'leva';
import useFetch from 'use-http';
import yaml from 'js-yaml';
import useStateRef from 'react-usestateref';
import { document } from '../third_party/browser-monads';
import { Scene } from '../three_components/scene';
import { Hydrate } from '../html_components';
import { list2menu } from '../three_components/leva_helper';
import { addNode, findByKey, removeByKey, upsert } from './util';
import { ServerEvent } from './interfaces';
import { pack, unpack } from "msgpackr";
import { Buffer } from "buffer";
import { AppContext } from "../index";
import { Store } from "./store";

export interface Node {
  key?: string;
  tag: string;
  children?: Node[] | string[] | null;

  [key: string]: unknown;
}

// type interface for a function that returns ReactNodes
export interface PropsFn {
  (data: Node[]): ReactNode | ReactNode[];
}

function makeProps(props?): PropsFn {
  return (data: Node[]) => {
    return (data || [])
      .map(({ key, ...child }: Node) => <Hydrate key={key} _key={key} {...props} {...child} />);
  };
}

interface QueryParams {
  scene?: string;
  frameloop?: "demand" | "always";
  xrMode?: "AR" | "VR" | "hidden";
}

interface SceneType {
  up: [ number, number, number ];
  xrMode: "AR" | "VR" | "hidden";
  frameloop: "demand" | "always";
  children: Node[];
  htmlChildren: Node[];
  rawChildren: Node[];
  bgChildren: Node[];
}


export type SceneContainerP = PropsWithChildren<{
  up?: [ number, number, number ];
  xrMode?: "AR" | "VR" | "hidden";
  stream?: Store<ServerEvent>;
  children?: ReactNode | ReactNode[];
  rawChildren?: ReactNode | ReactNode[];
  htmlChildren?: ReactNode | ReactNode[];
  bgChildren?: ReactNode | ReactNode[];
  [key: string]: unknown;
}>;


const SceneAttrs = [
  'children', 'rawChildren', 'htmlChildren', 'bgChildren'
]

export type SetEvent = ServerEvent & { data: { tag: string } & SceneType };
export type AddEvent = ServerEvent & { data: { nodes: Node[], to: string } };
export type UpdateEvent = ServerEvent & { data: { nodes: Node[] } };
export type UpsertEvent = ServerEvent & { data: { nodes: Node[], to: string } };
export type RemoveEvent = ServerEvent & { data: { keys: string[] } };

export default function SceneContainer({
  stream,
  children,
  rawChildren,
  htmlChildren,
  bgChildren,
  ...rest
}: SceneContainerP) {

  const queries = useMemo<QueryParams>(() =>
    queryString.parse(document.location.search) as QueryParams, []);

  const { response } = useFetch(queries.scene, []);

  const [ scene, setScene, sceneRef ] = useStateRef<SceneType>({
    up: null,
    xrMode: queries.xrMode || "VR",
    frameloop: queries.frameloop || "demand",
    children: [],
    htmlChildren: [],
    rawChildren: [],
    bgChildren: [],
    ...rest,
  });


  const [ menu, setMenu ] = useState({});
  const { showError } = useContext(AppContext)

  useEffect(() => {
    // do not change the scene using Fetch unless queries.scene is set.
    if (!queries.scene) return;

    const scene_uri: string = queries.scene.toLowerCase();
    let _scene;
    if (scene_uri.endsWith('.json')) {
      _scene = response.data;
    } else if (scene_uri.endsWith('.yml') || scene_uri.endsWith('.yaml')) {
      _scene = yaml.load(response.data);
    } else if (queries.scene) {
      try {
        const b = new Buffer(queries.scene, "base64");
        _scene = unpack(b);
      } catch (e) {
        console.log("Failed to parse scene", e);
        _scene = { children: [] };
      }
    } else {
      console.log('not implemented');
    }
    if (!!scene) setScene(_scene);
    setMenu(list2menu(_scene.children, false));
  }, [ queries.scene, response.data ]);

  useControls(
    () => ({
      'Camera Control': folder(
        {
          show_cameras: { value: false, label: 'Show Cameras' },
        },
        { collapsed: true },
      ),
      "Share": button(
        () => {
          const sceneStr = pack(scene);
          if (sceneStr.length > 10_000) {
            return showError(`The scene likely contains a large amount of data. To share, please replace 
      geometry data with an URI. Length is ${sceneStr.length} bytes.`)
          }
          const chars = String.fromCharCode.apply(null, sceneStr)
          const scene64b = btoa(chars);
          const url = new URL(document.location);
          url.searchParams.set('scene', scene64b);
          document.location.href = url.toString();
        },
        // @ts-ignore: leva is broken
        { label: "Share Scene" }
      ),
      Scene: folder({}),
      Render: folder(
        {
          // showRender: { value: false, label: "Show Rendering" },
        },
        { collapsed: true },
      ),
      'Scene.Options': folder(
        {
          ...menu,
        },
        { collapsed: true, order: -2 },
      ),
    }),
    [ menu, scene ],
  );

  useEffect(() => {

    const removeSet = stream.subscribe("SET", ({ ts, etype, data }: SetEvent) => {
      // the top level is a dummy node
      if (data.tag !== "Scene") showError(`The top level node of the SET operation must be a <Scene/> object, got <${data.tag}/> instead.`)
      setScene(data as SceneType);
    })

    const removeAdd = stream.subscribe("ADD", ({ ts, etype, data }: AddEvent) => {
      // the API need to be updated, so are the rest of the API.
      const { nodes, to: parentKey } = data;
      let dirty;
      for (const node of nodes) {
        try {
          const hasAdded = addNode(sceneRef.current, node, parentKey);
          dirty = dirty || hasAdded;
        } catch (e) {
          showError(`Failed to add node ${node.key} to ${parentKey}. ${e}`);
        }
      }
      if (dirty) setScene({ ...sceneRef.current });
    })
    const removeUpdate = stream.subscribe("UPDATE", ({ ts, etype, data }: UpdateEvent) => {
      /* this is the find and update. */
      let dirty = false;
      const { nodes } = data;
      for (const { key, ...props } of nodes) {
        const node = findByKey(sceneRef.current, key, SceneAttrs);
        if (node) {
          Object.assign(node, props);
          dirty = true;
        } else {
          console.log('node not found', key, sceneRef.current);
        }
      }
      if (dirty) {
        // note: use the spread to create a new instance to trigger update.
        setScene({ ...sceneRef.current });
      }
    })
    const removeUpsert = stream.subscribe("UPSERT", ({ ts, etype, data }: UpsertEvent) => {
      /* this is the find and update, or add if not found.. */
      const { nodes, to } = data;
      const parentKey = to || 'children';

      if (SceneAttrs.indexOf(parentKey) > -1) {
        upsert(sceneRef.current, nodes, parentKey);
      } else {
        const parent = findByKey(sceneRef.current, parentKey, SceneAttrs);
        if (!parent) return showError(`Failed to find parent ${parentKey}`);
        upsert(parent, nodes, 'children');
      }
      // note: use the spread to create a new instance to trigger update.
      setScene({ ...sceneRef.current });
    })
    const removeRemove = stream.subscribe("REMOVE", ({ ts, etype, data }: RemoveEvent) => {
      const { keys } = data;
      let dirty;
      for (const key of keys) {
        const removed = removeByKey(sceneRef.current, key);
        dirty = dirty || removed;
      }
      if (dirty) setScene({ ...sceneRef.current });
    })
    return () => {
      removeSet();
      removeAdd();
      removeUpdate()
      removeUpsert();
      removeRemove();
    }
  }, [ stream ])

  const {
    children: sceneChildren,
    rawChildren: sceneRawChildren,
    bgChildren: sceneBackgroundChildren,
    htmlChildren: sceneHtmlChildren,
    ..._scene
  } = scene;


  const toProps = useCallback(makeProps(), []);

  // todo: might want to treat scene as one of the children.
  // note: finding a way to handle the leva menu will be tricky.
  return (
    <>
      <Scene
        rawChildren={sceneRawChildren.length
          ? toProps(sceneRawChildren)
          : (rawChildren || [])}
        bgChildren={sceneBackgroundChildren.length
          ? toProps(sceneBackgroundChildren)
          : (bgChildren || [])}
        htmlChildrem={sceneHtmlChildren.length
          ? toProps(sceneHtmlChildren)
          : (htmlChildren || [])}
        {..._scene}
      >
        {sceneChildren.length ? toProps(sceneChildren) : (children || [])}
      </Scene>
    </>
  );
}
