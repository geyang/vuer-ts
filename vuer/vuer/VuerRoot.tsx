import React, { createContext, PropsWithRef, useContext, useMemo } from 'react';
import queryString from 'query-string';
import { Leva } from 'leva';
import { document } from '../third_party/browser-monads';
import { useSocket } from './websocket';
import { SceneContainer, SceneContainerP } from './SceneContainer';

interface QueryParams {
  collapseMenu?: string;
  xrMode?: 'inline' | 'AR' | 'VR' | 'hidden';
}

interface VuerRootProps extends PropsWithRef<SceneContainerP> {
  style?: object;
}

export const AppContext = createContext({
  showError: (msg: string) => console.error(msg),
  showInfo: (msg: string) => console.info(msg),
  showSuccess: (msg: string) => console.log(msg),
  showWarning: (msg: string) => console.warn(msg),
  showModal: (msg: string) => {
    console.log(msg);
  },
});

export const AppProvider = AppContext.Provider;

export function VuerRoot({ style = {}, ...rest }: VuerRootProps) {
  const queries = useMemo<QueryParams>(() => {
    const parsed = queryString.parse(document.location.search) as QueryParams;
    if (typeof parsed.collapseMenu === 'string')
      parsed.collapseMenu = parsed.collapseMenu.toLowerCase();
    return parsed;
  }, []);
  const collapseMenu = useMemo<boolean>(
    () => queries.collapseMenu === 'true',
    [ queries.collapseMenu ],
  );

  const sceneStyle = useMemo(
    () => ({
      position: 'absolute',
      width: '100%',
      height: '100%',
      zIndex: 10,
      overscrollBehaviorX: 'none',
      ...style,
    }),
    [ style ],
  );

  const { downlink } = useSocket();

  // todo: might want to treat scene as one of the children.
  // note: finding a way to handle the leva menu will be tricky.
  return (
    <>
      <SceneContainer style={sceneStyle} stream={downlink} {...rest} />
      <Leva
        theme={{
          sizes: {
            rootWidth: '380px',
            controlWidth: '200px',
            numberInputMinWidth: '56px',
          },
        }}
        collapsed={collapseMenu}
      />
    </>
  );
}
