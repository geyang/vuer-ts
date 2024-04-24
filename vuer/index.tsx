import { createContext, PropsWithRef, useMemo, } from 'react';
import queryString from 'query-string';
import { Leva } from 'leva';
import { document } from './third_party/browser-monads';
import { WebSocketProvider } from './html_components/contexts/websocket';
import SceneContainer, { SceneContainerP } from "./three_components";

export interface Node {
  key?: string;
  tag: string;
  children?: Node[] | string[] | null;

  [key: string]: unknown;
}


interface QueryParams {
  collapseMenu?: string;
  xrMode?: "inline" | "AR" | "VR" | "hidden";
}

type VuerRootProps = PropsWithRef<{ style?: object} & SceneContainerP>;

export const AppContext = createContext({
  showError: (msg: string) => console.error(msg),
  showInfo: (msg: string) => console.info(msg),
  showSuccess: (msg: string) => console.log(msg),
  showWarning: (msg: string) => console.warn(msg),
  showModal: (msg: string) => {
    console.log(msg);
  }
});

export const AppProvider = AppContext.Provider;

function VuerRoot({ style = {}, ...rest }: VuerRootProps) {

  const queries = useMemo<QueryParams>(() => {
    const parsed = queryString.parse(document.location.search) as QueryParams;
    if (typeof parsed.collapseMenu === 'string') parsed.collapseMenu = parsed.collapseMenu.toLowerCase();
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
      ...style,
    }),
    [ style ],
  );

  // todo: might want to treat scene as one of the children.
  // note: finding a way to handle the leva menu will be tricky.
  return (
    <WebSocketProvider>
      <SceneContainer style={sceneStyle} {...rest}/>
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
    </WebSocketProvider>
  );
}

export default VuerRoot;