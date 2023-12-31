import {PropsWithChildren, useCallback, useEffect, useMemo, useState} from "react";
import useStateRef from "react-usestateref";
import queryString from "query-string";
import {document} from "./_lib/_browser-monads";
import ThreeScene from "./_components/_three_components/_scene";
import {Hydrate} from "./_components/_index";
import {folder, Leva, useControls} from "leva";
import useFetch from "use-http";
import yaml from "js-yaml";
import {list2menu} from "./_components/_three_components/_leva_helper";
import {addNode, findByKey, removeByKey} from "./_util";
import {WebSocketProvider} from "./_components/_contexts/_websocket";
import {parseArray} from "./_components/_three_components/_utils";


import {ServerEvent} from "./_interfaces";

// The dataloader component hides the list of children from the outer scope.
// this means we can not directly show the
export type Node = {
    key?: string;
    tag: string;
    children?: Node[];
    [key: string]: any;
};

function makeProps(props?: any) {
    const toProps = (data: Node[]) => {
        const children = (data || [])
            .map(({key, ...child}: Node) => {
                return <Hydrate key={key} _key={key} {...props} {...child} />;
            });
        return {children};
    };
    return toProps;
}

type QueryParams = {
    scene?: string;
    collapseMenu?: string;
    initCameraPosition?: number[];
    pointSize?: string;
}

type SceneType = {
    children: Node[];
    htmlChildren: Node[];
    rawChildren: Node[];
    backgroundChildren: Node[];
}

export default function Vuer({style, children: _, ..._props}: PropsWithChildren<any>) {

    console.log("print this is working.")

    const queries = useMemo<QueryParams>(() => {
        const parsed = queryString.parse(document.location.search);
        if (typeof parsed.collapseMenu === "string") parsed.collapseMenu = parsed.collapseMenu.toLowerCase();
        // @ts-ignore
        parsed.initCameraPosition = parseArray(parsed.initCameraPosition);
        return parsed;
    }, []);
    const collapseMenu = useMemo<boolean>(() => queries.collapseMenu === "true",
        [queries.collapseMenu]);

    // // for server-side rendering
    // if (typeof window === "undefined") return <div>threejs view server-side rendering</div>;

    const [scene, setScene, sceneRef] = useStateRef<SceneType>({
        children: [],
        htmlChildren: [],
        rawChildren: [],
        backgroundChildren: [],
    });

    const [menu, setMenu] = useState({});
    const {response} = useFetch<any>(queries.scene, [queries.scene]);

    useEffect(() => {
        // do not change the scene using Fetch unless queries.scene is set.
        if (!queries.scene) return;

        // @ts-ignore
        const scene_uri: string = queries.scene.toLowerCase();
        let __scene;
        if (!response || !response.ok) __scene = {children: []};
        else if (scene_uri.endsWith(".json")) {
            __scene = response.data;
        } else if (scene_uri.endsWith(".yml") || scene_uri.endsWith(".yaml")) {
            __scene = yaml.load(response.data);
        } else if (queries.scene) {
            // try {
            //   const jsonStr = atob(queries.scene);
            //   __scene = JSON.parse(jsonStr)
            // } catch (e) {
            //   console.log("Failed to parse scene", e);
            //   __scene = {children: []};
            // }
            console.log("not implemented");
        } else {
            __scene = {children: []};
        }
        if (typeof __scene.children === "undefined")
            __scene = {children: __scene};
        setScene(__scene);
        setMenu(list2menu(__scene.children, false));
    }, [queries.scene, response.data]);

    const [
        {
            // "Socket URI": socketURI,
            // enableMarker,
            // markerRadius,
            // markerAverage,
            // progressive,
            // renderHeight,
            // useAlpha,
            // channel,
            // heatmap,
            // heatmapColormap,
            // showMask,
            // shade,
            // alphaThreshold,
            // shadeColor,
            // query,
            // negativeQueries,
            // normalize,
            // gain,
            // clip,
            // temperature,
            // colormap,
        },
    ] = useControls(
        function () {
            return {
                "Camera Control": folder(
                    {
                        show_cameras: {value: false, label: "Show Cameras"},
                    },
                    {collapsed: true}
                ),
                // "Take Screenshot": button(() => {}, {disabled: true}),
                Scene: folder({}),
                Render: folder(
                    {
                        // showRender: { value: false, label: "Show Rendering" },
                    },
                    {collapsed: true}
                ),
                "Scene.Options": folder(
                    {
                        // show_this: false,
                        // showNodes: { value: true, label: "Show Nodes" },
                        // pointSize: {
                        //   value: queries.pointSize ? parseFloat(queries.pointlSize) : 1.5,
                        //   min: 0.1,
                        //   max: 100,
                        //   step: 0.1,
                        //   pad: 1,
                        //   label: "PC Point Size",
                        // },
                        ...menu,
                    },
                    {collapsed: true, order: -2}
                ),
            };
        },
        [menu]
    );

    const onMessage = useCallback(
        ({etype, data}: ServerEvent) => {
            if (etype === "SET") {
                // the top level is a dummy node
                setScene(data as SceneType);
                // } else if (etype === "SET_LEVA") {
                //   setCustomLeva(data);
            } else if (etype === "ADD") {
                // the API need to be updated, so are the rest of the API.
                const {nodes, to: parentKey} = data;
                let dirty;
                console.log("before adding", scene.children);
                for (const node of nodes) {
                    dirty = dirty || addNode(sceneRef.current, node, parentKey);
                }
                console.log("is dirty?", dirty, scene.children);
                if (dirty) setScene({...sceneRef.current});
            } else if (etype === "UPDATE") {
                let dirty = false;
                const {nodes} = data;
                for (const {key, ...props} of nodes) {
                    const node = findByKey(sceneRef.current, key, [
                        "rawChildren",
                        "htmlChildren",
                        "backgroundChildren",
                    ]);
                    if (node) {
                        Object.assign(node, props);
                        dirty = true;
                    } else {
                        console.log("node not found", key, sceneRef.current);
                    }
                }
                if (dirty) {
                    // note: use the spread to create a new instance to trigger update.
                    setScene({...sceneRef.current});
                }
            } else if (etype === "REMOVE") {
                const {keys} = data;
                let dirty;
                console.log("before adding", scene.children);
                for (const key of keys) {
                    dirty = dirty || removeByKey(sceneRef.current, key);
                }
                console.log("is dirty?", dirty, scene.children);
                if (dirty) setScene({...sceneRef.current});
            } else {
            }
        },
        []
    );

    const {
        children: sceneChildren,
        htmlChildren: sceneHtmlChildren,
        rawChildren: sceneRawChildren,
        backgroundChildren: sceneBackgroundChildren,
        ..._scene
    } = scene;

    const rest = {
        // markerRadius,
        // markerAverage,
        // enableMarker,
        // background,
        // sendMsg,
        initCameraPosition: queries.initCameraPosition,
        ..._props,
        // add the scene params here to allow programmatic override
        ..._scene,
    };

    const toProps = useCallback(makeProps(), []);

    const children = sceneChildren ? toProps(sceneChildren).children : [];
    const rawChildren = sceneRawChildren
        ? toProps(sceneRawChildren).children
        : [];
    const htmlChildren = sceneHtmlChildren
        ? toProps(sceneHtmlChildren).children
        : [];
    const backgroundChildren = sceneBackgroundChildren
        ? toProps(sceneBackgroundChildren).children
        : [];

    const sceneStyle = useMemo(
        () => ({
            position: "absolute",
            width: "100%",
            height: "100%",
            zIndex: 10,
            ...(style || {}),
        }),
        [style]
    );

    return (
        // <div style={{ overflow: "hidden" }}>
        <WebSocketProvider onMessage={onMessage}>
            <ThreeScene
                backgroundChildren={backgroundChildren}
                style={sceneStyle}
                rawChildren={rawChildren}
                htmlChildren={htmlChildren}
                {...rest}
            >
                {children}
            </ThreeScene>
            <Leva
                theme={{
                    sizes: {
                        rootWidth: "380px",
                        controlWidth: "200px",
                        numberInputMinWidth: "56px",
                    },
                }}
                collapsed={collapseMenu}
            />
        </WebSocketProvider>
        // </div>
    );
}
