import {PropsWithChildren, useCallback, useContext, useMemo, useRef} from "react";
import {Canvas, extend} from "@react-three/fiber";
import {Controllers, Hands, VRButton, XR} from "@react-three/xr";
import {GizmoHelper, GizmoViewport} from "@react-three/drei";
import {SSAOPass, UnrealBloomPass} from "three-stdlib";
// import {TextGeometry} from "three/examples/jsm/geometries/TextGeometry";
import {BufferGeometry, Mesh} from "three";
import {acceleratedRaycast, computeBoundsTree, disposeBoundsTree,} from "three-mesh-bvh";
import {CameraLike, OrbitCamera} from "./_camera";
import {Download} from "./_download";
import {Perf} from "r3f-perf";
// import {FileDrop} from "../_file_drop";
import {Grid} from "./_grid";
import {PointerControl} from "./_controls/_pointer";
import {SceneGroup} from "./_group";
import {SocketContext, SocketContextType} from "../_contexts/_websocket";
import {BackgroundColor} from "./_color";
import queryString, {ParsedQuery} from "query-string";
import {document} from "../../_lib/_browser-monads";
import {ClientEvent} from "../../_interfaces";

// question: what does this do? - Ge
Mesh.prototype.raycast = acceleratedRaycast;
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
BufferGeometry.prototype.disposeBoundsTreee = disposeBoundsTree;

extend({
    SSAOPass,
    UnrealBloomPass,
    // TextGeometry,
});


type ThreeProps = PropsWithChildren<{
    _key?: string;
    canvasRef?: any;
    className?: string;
    style?: any;
    backgroundChildren?: any | any[];
    rawChildren?: any | any[];
    htmlChildren?: any | any[];
}>;

export default function ThreeScene(
    {
        _key: key,
        canvasRef: _canvasRef,
        className,
        style,
        children,
        backgroundChildren,
        // these are not transformed.
        rawChildren,
        htmlChildren,
    }: ThreeProps
) {
    const ref = useRef<HTMLCanvasElement>();
    const canvasRef = _canvasRef || ref;
    const {sendMsg, uplink} = useContext(SocketContext) as SocketContextType;
    const queries = useMemo<ParsedQuery>(
        () => queryString.parse(document.location.search), []);

    const onCameraMove = useCallback(
        (camera: CameraLike) => {
            uplink?.publish({
                etype: "CAMERA_MOVE",
                key: "defaultCamera",
                value: {
                    camera: {
                        ...camera,
                        height: canvasRef.current?.clientHeight,
                        width: canvasRef.current?.clientWidth,
                    },
                },
            } as ClientEvent);
        },
        [sendMsg, uplink]
    );

    const divStyle = useMemo(
        () => ({
            overflow: "hidden",
            ...(style || {
                height: "300px",
                width: "400px",
                border: "1px solid black",
                margin: "5px 5px 5px 5px",
            }),
        }),
        [style]
    );

    // style="width: 80%; height: 100%; position: absolute; z-index: 10;"
    return (
        <>
            <div style={divStyle} className={className}>
                <VRButton/>
                <Canvas
                    ref={canvasRef}
                    shadows
                    // preserve buffer needed for download
                    gl={{antialias: true, preserveDrawingBuffer: true}}
                    frameloop="demand"
                    // why set it to 1: https://stackoverflow.com/a/32936969/1560241
                    tabIndex={1}
                >
                    <BackgroundColor/>
                    <XR>
                        {queries.debug || queries.perf ? (
                            <Perf position="top-left"/>
                        ) : null}
                        {/*<FileDrop/>*/}
                        <Download/>
                        <Hands/>
                        <Controllers/>
                        <PointerControl
                            parent={canvasRef}
                            parentKey={key}
                        />
                        <Grid/>
                        {backgroundChildren}
                        <SceneGroup>{children}</SceneGroup>
                        {rawChildren}
                        <OrbitCamera
                            parent={canvasRef}
                            onChange={onCameraMove}
                            panSpeed={1}
                        />
                        <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
                            <GizmoViewport
                                axisColors={["#9d4b4b", "#2f7f4f", "#3b5b9d"]}
                                labelColor="white"
                            />
                        </GizmoHelper>
                    </XR>
                </Canvas>
                {/*<Leva*/}
                {/*  isRoot*/}
                {/*  left={10}*/}
                {/*  collapsed={queries.collapseMenu === "true"}*/}
                {/*  style={{ zIndex: 10000000 }}*/}
                {/*/>*/}
            </div>
            {htmlChildren}
        </>
    );
}
