import {createContext, PropsWithChildren, useCallback, useEffect, useMemo, useState} from "react";
import useWebSocket from "react-use-websocket";
import {document} from "../../_lib/_browser-monads";
import {button, useControls} from "leva";
import useStateRef from "react-usestateref";
import queryString from "query-string";
import {Store} from "../_store";
import {pack, unpack} from "msgpackr";


import {ClientEvent, ServerEvent} from "../../_interfaces";

export type msgFn = (event: ClientEvent) => void;
export type SocketContextType = {
    sendMsg: msgFn;
    uplink: Store<ClientEvent>;
    downlink: Store<ServerEvent>;
};
export const SocketContext = createContext<SocketContextType | undefined>(undefined);

type WebSocketProviderProps = PropsWithChildren<{
    onMessage?: (event: ServerEvent) => void;
}>;
type wsQueries = {
    ws?: string;
};
export const WebSocketProvider = ({onMessage: paramsOnMessage, children}: WebSocketProviderProps) => {
    const [isConnected, setIsConnected,] = useStateRef(false);
    const [connectWS, setConnectWS] = useState(true);
    const [reconnect, allowReconnect] = useState(true);
    const [, , shouldReconnect] = useStateRef(true);

    const queries = useMemo<wsQueries>(() => queryString.parse(document.location.search), []);
    const uplink = useMemo<Store<ClientEvent>>(() => new Store(), []);
    const downlink = useMemo<Store<ServerEvent>>(() => new Store(), []);

    const {socketURI} = useControls("Connection", {
        socketURI: {
            value: queries.ws || "ws://localhost:8012",
            order: 0,
            label: "Socket URI",
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
                label: isConnected ? "Reconnect" : "Disconnected",
                order: -10,
            }
        ),
    });

    const onMessage = useCallback(
        ({data: message}: MessageEvent) => {
            // const event = JSON.parse(message);
            if (!message?.arrayBuffer) return;
            message.arrayBuffer().then((buf: Buffer) => {
                const event = unpack(buf);
                if (typeof paramsOnMessage === "function") paramsOnMessage(event);
                downlink.publish(event);
            });
        },
        [socketURI]
    );

    function onOpen() {
        sendMsg({etype: "INIT"});
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

    const {sendMessage, readyState} = useWebSocket(
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
            reconnectAttempts: 3,
            reconnectInterval: 2000,
        },
        (!!socketURI && connectWS)
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
            const message = pack(event)
            if (event) sendMessage(message);
        },
        [readyState]
    );

    useEffect(() => uplink.subscribe("*", sendMsg), [sendMsg, uplink]);

    return (
        <SocketContext.Provider value={{sendMsg, uplink, downlink} as SocketContextType}>
            {children}
        </SocketContext.Provider>
    );
};
