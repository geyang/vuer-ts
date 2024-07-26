import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import useWebSocket from 'react-use-websocket';
import { button, useControls } from 'leva';
import useStateRef from 'react-usestateref';
import queryString from 'query-string';
import { pack, unpack } from 'msgpackr';
import { Store } from './store';
import { document } from '../third_party/browser-monads';

import { ClientEvent, ServerEvent } from './interfaces';

export type msgFn = (event: ClientEvent) => void;
export type SocketContextType = {
  sendMsg: msgFn;
  uplink: Store<ClientEvent>;
  downlink: Store<ServerEvent>;
};
export const SocketContext = createContext<SocketContextType | undefined>(
  undefined,
);

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

const DEFAULT_PORT = 8012;

function getSocketURI(queryWS?: string): string {
  // queries.ws || `${window.location.hostname}:${window.location.port}` || 'ws://localhost:8012',
  if (!!queryWS) return queryWS as string;
  if (window.location.hostname == 'vuer.ai')
    return `ws://localhost:${DEFAULT_PORT}`;
  if (window.location.protocol == 'https:')
    return `wss://${window.location.hostname}`;
  return `ws://${window.location.hostname}:${window.location.port || DEFAULT_PORT}`;
}

type WebSocketProviderProps = PropsWithChildren<{
  onMessage?: (event: ServerEvent) => void;
}>;
type wsQueries = {
  ws?: string;
  reconnect?: string; // should get turned into numbers
  interval?: string; // should get turned into numbers
};

export function WebSocketProvider({
  onMessage: paramsOnMessage,
  children,
}: WebSocketProviderProps) {
  const [isConnected, setIsConnected] = useStateRef(false);
  const [connectWS, setConnectWS] = useState(true);
  const [reconnect, allowReconnect] = useState(true);
  const [, , shouldReconnect] = useStateRef(true);

  const queries = useMemo<wsQueries>(
    () => queryString.parse(document.location.search),
    [],
  );
  const uplink = useMemo<Store<ClientEvent>>(() => new Store(), []);
  const downlink = useMemo<Store<ServerEvent>>(() => new Store(), []);

  const { socketURI } = useControls('Connection', {
    socketURI: {
      value: getSocketURI(queries.ws),
      order: 0,
      label: 'Socket URI',
    },
    reconnect: button(
      () => {
        setConnectWS(false);
        allowReconnect(false);
        setTimeout(() => {
          setConnectWS(true);
        }, 100);
      },
      {
        disabled: !reconnect,
        // @ts-ignore: there seems to be something wrong with the button type.
        label: isConnected ? 'Reconnect' : 'Disconnected',
        order: -10,
      },
    ),
  });

  const onMessage = useCallback(
    ({ data: message }: MessageEvent) => {
      if (!message?.arrayBuffer) return;
      message.arrayBuffer().then((buf: Buffer) => {
        const event = unpack(buf);
        if (typeof paramsOnMessage === 'function') paramsOnMessage(event);
        downlink.publish(event);
      });
    },
    [socketURI],
  );

  function onOpen() {
    sendMsg({ etype: 'INIT' } as ClientEvent);
    setIsConnected(true);
    allowReconnect(true);
  }

  function onClose() {
    setIsConnected(false);
    allowReconnect(false);
  }

  function onError() {
    setIsConnected(false);
    allowReconnect(false);
  }

  function onReconnectStop() {
    allowReconnect(true);
  }

  const { sendMessage, readyState } = useWebSocket(
    socketURI,
    {
      onOpen,
      onError,
      onClose,
      onMessage,
      onReconnectStop,
      share: true,
      retryOnError: true,
      shouldReconnect() {
        return shouldReconnect.current;
      },
      reconnectAttempts: queries.reconnect ? parseInt(queries.reconnect) : 3,
      reconnectInterval: queries.interval ? parseInt(queries.interval) : 3000,
    },
    !!socketURI && connectWS,
  );

  const sendMsg = useCallback<msgFn>(
    (event: ClientEvent) => {
      if (!readyState) return;
      // race condition, avoid without testing.
      // if (!isConnected) return;
      // normalize the event object
      // if (!event?.value) event.value = {};
      // this is the middle ware.
      // catch all. Needed for INIT event handling
      // if (event) sendJsonMessage(event);
      const message = pack(event);
      if (event) sendMessage(message);
    },
    [readyState],
  );

  useEffect(() => uplink.subscribe('*', sendMsg), [sendMsg, uplink]);

  return (
    <SocketContext.Provider
      value={{ sendMsg, uplink, downlink } as SocketContextType}
    >
      {children}
    </SocketContext.Provider>
  );
}
