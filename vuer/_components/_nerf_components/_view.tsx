import {
    createContext,
    ReactElement,
    useCallback,
    useContext,
    useEffect,
    useLayoutEffect,
    useMemo,
    useState,
} from "react";
import {button, buttonGroup, useControls} from "leva";
import {RenderPlane} from "../_three_components/_render_plane";
import {SocketContext, SocketContextType} from "../_contexts/_websocket";
import {BBox} from "../_three_components/_primitives/_bbox";
import {GroupSlave, rot2array, scale2array, v3array,} from "../_three_components/_group";
import {ButtonInput, ButtonSettings} from "leva/plugin";
import {ClientEvent, ServerEvent, VuerProps} from "../../_interfaces";
import {V3} from "../_three_components/_number_types";

export const RenderContext = createContext({});

// A very simple control middleware component that inserts parameters
// for specific client events.
type ButtonProps = ClientEvent & { type: string } & ButtonSettings;

function buttonHelper(
    key: string,
    // the type: key is used to indicate that this is a button object.
    {type, etype, ...options}: ButtonProps,
    sendMsg: (e: ClientEvent) => void
): ButtonInput | any {
    if (type === "BUTTON") return button(() => sendMsg({key, etype} as ClientEvent), options);
    return {type, ...options};
}


export interface RenderLayerParams {
    key: string;
}


export type BaseRenderSettingsType = {
    renderHeight: number;
    progressive: number;
    use_aabb: boolean;
    aabb_min: V3;
    aabb_max: V3;
    layers: string[];
};

export type RenderProps = VuerProps<{
    layers: string[];
    children: ReactElement[];
    settings: {
        [key: string]: never;
    };
}>;

export function Render(
    {
        // _key,
        layers = [],
        settings = {},
        children = [],
    }: RenderProps
) {
    let controls: any, setLeva: (state: any) => void;
    const context = useMemo<{ layers: Set<ReactElement> }>(
        () => ({layers: new Set()}),
        []
    );
    const {uplink} = useContext(SocketContext) as SocketContextType;

    // eslint-disable-next-line prefer-const
    [controls, setLeva] = useControls(
        // _key ? `Render-${_key}` : "Render",
        "Render",
        () => ({
            renderHeight: {
                value: 768,
                min: 1,
                max: 2304,
                step: 1,
                pad: 1,
                label: "Height",
            },
            "Res Presets": buttonGroup({
                // label: "Res Presets",
                opts: {
                    384: () => setLeva({renderHeight: 384}),
                    480: () => setLeva({renderHeight: 480}),
                    768: () => setLeva({renderHeight: 768}),
                    960: () => setLeva({renderHeight: 960}),
                    1536: () => setLeva({renderHeight: 1536}),
                },
            }),
            progressive: {
                value: -2,
                min: -3,
                max: 0,
                step: 0.5,
                label: "Progressive Scale",
            },
            Presets: buttonGroup({
                // label: "Preset",
                opts: {
                    "-3": () => setLeva({progressive: -3}),
                    "-2.5": () => setLeva({progressive: -2.5}),
                    "-2": () => setLeva({progressive: -2}),
                    "-1.5": () => setLeva({progressive: -1.5}),
                    "-1": () => setLeva({progressive: -1}),
                    "-1/2": () => setLeva({progressive: -0.5}),
                    "/": () => setLeva({progressive: 0}),
                },
            }),
        }), [layers]);
    const _settings = useMemo(() => {
        return Object.entries(settings || {})
            .reduce((acc, [key, value]) => {
                return {...acc, [key]: buttonHelper(key, value, uplink.publish)};
            }, {});
    }, [settings]);

    const l = useMemo<ReactElement[]>(() => {
        const keyVals = children.map((c: ReactElement) => [
            c.key,
            {value: layers.indexOf(c.key as string) >= 0, label: `[${c.key}]`},
        ]);
        const layer_settings = Object.fromEntries(keyVals);
        // console.log("layer settings", layer_settings, layers);ˆ
        return layer_settings;
    }, []);

    const layerSelect = useControls(
        "Render.Layers", l, [layers]
    ) as { [key: string]: boolean };
    const selectChildren = useMemo<ReactElement[]>(
        // @ts-ignore: something is wrong
        () => children.filter((c: ReactElement) => layerSelect[c.key]),
        [layerSelect]
    );

    const renderSettings = useControls(
        "Render.more․․․", _settings, {
            collapsed: true,
        }) as BaseRenderSettingsType;
    // the world position and rotations are added on the top.
    useEffect(() => {
        setTimeout(() => uplink?.publish({etype: "CAMERA_UPDATE"}), 0);
        return uplink.addReducer("CAMERA_MOVE", (event) => {
            // const layers = context.layers;
            // console.log("context", context, "layers", layers);
            const payload = {
                ...event,
                value: {
                    ...event.value,
                    render: {
                        ...(event.value.render || {}),
                        // ideally this should be done as part of the schema.
                        // progressive: Math.pow(2, progressive),
                        ...controls,
                        ...renderSettings,
                        // cast to list
                        layers: selectChildren.map((c) => c.key),
                    },
                },
            };
            // console.log("payload", payload);
            return payload;
        });
    }, [selectChildren, uplink, renderSettings, controls]);

    return (
        <>
            {renderSettings.use_aabb ? (
                <GroupSlave>
                    <BBox min={renderSettings.aabb_min} max={renderSettings.aabb_max}/>
                </GroupSlave>
            ) : null}
            <RenderContext.Provider value={context}>
                {selectChildren}
            </RenderContext.Provider>
        </>
    );
}

type RenderLayerProps = VuerProps<{
    _key: string,
    channel: string,
    alphaChannel: string,
    title: string,
    settings: never,
    distance: number,
    interpolate: boolean,
    opacity: number,
    folderOptions: never,
}>;

type BaseRenderParamsType = {
    position: V3;
    rotation: V3;
    scale: number | V3;
    aabb_min: V3;
    aabb_max: V3;
    use_aabb: boolean;
    useAlpha: boolean;

    channel: string;
    alphaChannel: string;
};

export function RenderLayer(
    {
        _key,
        /** local parameters */
        title = `Render.Channel [${_key}]`,
        // these two are now included in the render parameters
        channel,
        alphaChannel,
        settings,
        distance = 10,
        interpolate = false,
        opacity = 1.0,
        folderOptions,
    }: RenderLayerProps
) {
    const [rgbURI, setRGB] = useState<Blob | string>();
    const [alphaURI, setAlphaMap] = useState<Blob | string>();
    const {uplink, downlink} = useContext(SocketContext) as SocketContextType;
    const setting_cache: { [key: string]: unknown } = useMemo(
        () =>
            Object.entries(settings || {}).reduce(
                (acc, [key, value]) => ({
                    ...acc,
                    [key]: buttonHelper(key, value as ButtonProps, uplink.publish),
                }),
                {}
            ),
        [settings, uplink.publish]
    );

    const renderParams = useControls(title, setting_cache, folderOptions, [
        settings,
    ]) as BaseRenderParamsType;
    // the world position and rotations are added on the top.
    useLayoutEffect(() => {
        setTimeout(() => uplink?.publish({etype: "CAMERA_UPDATE"}), 0);
        return uplink.addReducer(
            "CAMERA_MOVE",
            (event: ClientEvent) => {
                // console.log("render layer: event", event);
                return {
                    ...event,
                    value: {
                        ...event.value,
                        render: {
                            ...(event.value.render || {}),
                            [_key]: renderParams
                        },
                    },
                };
            },
            channel
        );
    }, [uplink, renderParams]);

    const control = useControls(
        `${title}.more․․․`,
        {
            interpolate: interpolate,
            distance: distance,
            opacity: {value: opacity || 1, label: "Opacity", min: 0, max: 1.0},
        },
        // @ts-ignore: this is a bug in leva.
        {label: "Options", collapsed: true},
        []
    );

    const onMessage = useCallback(
        ({etype, data}: ServerEvent) => {
            // console.log("RenderLayer", etype, data);
            if (etype !== "RENDER") return;

            if (channel in data) {
                // allow local rendering params over-ride.
                let uri = data[renderParams.channel || channel];
                if (!uri) return;
                if (!uri?.startsWith || !uri.startsWith("data:image/")) {
                    const blob = new Blob([uri], {type: "image"});
                    uri = blob;
                }
                setRGB(uri);
            }
            if (alphaChannel in data) {
                // allow local rendering params over-ride.
                let uri = data[renderParams.alphaChannel || alphaChannel];
                if (!uri) return;
                if (!uri?.startsWith || !uri?.startsWith("data:image/")) {
                    const blob = new Blob([uri], {type: "image"});
                    uri = blob;
                }
                setAlphaMap(uri);
            }
        },
        [renderParams.useAlpha]
    );
    useLayoutEffect(() => downlink.subscribe("RENDER", onMessage), [downlink]);

    return (
        <>
            {renderParams.use_aabb ? (
                <GroupSlave>
                    <group
                        position={v3array(renderParams.position)}
                        rotation={rot2array(renderParams.rotation)}
                        scale={scale2array(renderParams.scale)}
                    >
                        <BBox min={renderParams.aabb_min} max={renderParams.aabb_max}/>
                    </group>
                </GroupSlave>
            ) : null}
            {rgbURI ? (
                <RenderPlane
                    src={rgbURI}
                    alphaSrc={renderParams.useAlpha ? alphaURI : undefined}
                    // todo: add displacementMap, and other texture maps.
                    distanceToCamera={control.distance}
                    interpolate={control.interpolate}
                    // useAlpha={renderParams.useAlpha}
                    opacity={control.opacity}
                />
            ) : null}
        </>
    );
}
