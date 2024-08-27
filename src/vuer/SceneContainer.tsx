import React, { PropsWithChildren, ReactNode, useContext, useEffect, useMemo } from 'react';
import queryString from 'query-string';
import { button, folder, useControls } from 'leva';
import { useFetch } from 'use-http';
import yaml from 'js-yaml';
import { document } from '../third_party/browser-monads';
import { pack, unpack } from 'msgpackr';
import * as bufferLib from 'buffer';
import * as usr from 'react-usestateref';
import { Scene } from '../three_components';
import { ClientEvent, ServerEvent } from './interfaces';
import { Store } from './store';
import { AppContext } from './VuerRoot';
import { SceneStoreType, useSceneStore } from './sceneStore.tsx';
import { SetOp } from './sceneGraph/eventHelpers.ts';
import { SceneType } from './sceneGraph/events.ts';
import { hydrate } from '../core_components.tsx';

const useStateRef = usr.default;

const { Buffer } = bufferLib;

interface QueryParams {
  scene?: string;
  frameloop?: 'demand' | 'always';
  xrMode?: 'AR' | 'VR' | 'hidden';
}

export type SceneContainerP = PropsWithChildren<{
  up?: [number, number, number];
  xrMode?: 'AR' | 'VR' | 'hidden';
  stream: Store<ServerEvent> | Store<ClientEvent>;
  children?: ReactNode | ReactNode[];
  rawChildren?: ReactNode | ReactNode[];
  htmlChildren?: ReactNode | ReactNode[];
  bgChildren?: ReactNode | ReactNode[];
  [key: string]: unknown;
}>;

export function SceneContainer(
  {
    stream,
    children,
    rawChildren,
    htmlChildren,
    bgChildren,
    ...rest
  }: SceneContainerP) {

  const {
    children: sceneChildren,
    rawChildren: sceneRawChildren,
    bgChildren: sceneBackgroundChildren,
    htmlChildren: sceneHtmlChildren,
    ops,
    ...scene
  } = useSceneStore() as SceneStoreType;

  const queries = useMemo<QueryParams>(() =>
    queryString.parse(document.location.search) as QueryParams, []);

  const { response } = useFetch(queries.scene, []);

  useEffect(() => {
    ops.rawUpdate((prev) => ({
      ...prev,
      // these are ReactNodes, not the correct type.
      // children,
      // rawChildren,
      // htmlChildren,
      // bgChildren,
      // ...rest,
      xrMode: queries.xrMode || 'VR',
      frameloop: queries.frameloop || 'demand',
    }));
  }, [children, rawChildren, htmlChildren, bgChildren, queries.xrMode, queries.frameloop]);

  useEffect(() => {
    const removeHandles = [
      stream.subscribe('SET', ops.set),
      stream.subscribe('ADD', ops.add),
      stream.subscribe('UPDATE', ops.update),
      stream.subscribe('UPSERT', ops.upsert),
      stream.subscribe('REMOVE', ops.removeByKey),
    ];
    return () => removeHandles.forEach(f => f());
  }, [stream]);

  const { showError } = useContext(AppContext);

  useEffect(() => {
    // do not change the scene using Fetch unless queries.scene is set.
    if (!queries.scene) return;

    const scene_uri: string = queries.scene.toLowerCase();
    let initScene: SceneType;
    if (scene_uri.endsWith('.json')) {
      initScene = response.data as SceneType;
    } else if (scene_uri.endsWith('.yml') || scene_uri.endsWith('.yaml')) {
      initScene = yaml.load(response.data) as SceneType;
    } else if (queries.scene) {
      try {
        const b = new Buffer(queries.scene, 'base64');
        initScene = unpack(b) as SceneType;
      } catch (e) {
        console.warn('Failed to parse scene', e);
      }
    } else return;

    // console.log('Setting scene', initScene);
    !!initScene && ops.set(SetOp({ tag: 'Scene', ...initScene }));

  }, [queries.scene, response.data]);

  useControls(
    () => ({
      'Camera Control': folder(
        {
          show_cameras: {
            value: false,
            label: 'Show Cameras',
          },
        },
        { collapsed: true },
      ),
      Share: button(
        () => {
          const sceneStr = pack({
            children: sceneChildren,
            rawChildren: sceneRawChildren,
            bgChildren: sceneBackgroundChildren,
            htmlChildren: sceneHtmlChildren,
            scene,
          });
          if (sceneStr.length > 10_000) {
            return showError(`
              The scene likely contains a large amount of data. To share, please replace 
              geometry data with an URI. Length is ${sceneStr.length} bytes.
            `);
          }
          // @ts-ignore: could not fix by casting to number
          const chars = String.fromCharCode.apply(null, sceneStr);
          const scene64b = btoa(chars);
          const url = new URL(document.location);
          url.searchParams.set('scene', scene64b);
          document.location.href = url.toString();
        },
        // @ts-ignore: leva is broken
        { label: 'Share Scene' },
      ),
      Scene: folder({}),
      Render: folder({}, { collapsed: true }),
      'Scene.Options': folder({}, { collapsed: true }),
    }),
    [scene],
  );

  // todo: might want to treat scene as one of the children.
  // note: finding a way to handle the leva menu will be tricky.
  return (
    <Scene
      rawChildren={hydrate(sceneRawChildren) || rawChildren}
      bgChildren={hydrate(sceneBackgroundChildren) || bgChildren}
      htmlChildrem={hydrate(sceneHtmlChildren) || htmlChildren}
      {...scene}
      {...rest}
    >
      {hydrate(sceneChildren) || children}
    </Scene>
  );
}
