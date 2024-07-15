import { useContext, useEffect, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import { ServerRPC } from "../../vuer/interfaces";
import { SocketContext, SocketContextType } from "../../vuer/websocket";
import { CameraLike } from "../camera";

export type GrabRenderEvent = ServerRPC & {
  // this is the UUID of the request.
  key: string;
  data: {
    // width: number;
    // height: number;
    // not being used in the camera_view component.
    downsample?: number;
    quality?: number;
  }
}

type GrabeRenderProps = {
  _key: string;
  // camera?: CameraLike;
}

const GrabRender = ({ _key = "DEFAULT" }: GrabeRenderProps) => {
  const dpr = window.devicePixelRatio || 1;
  const { sendMsg, downlink, uplink } = useContext(SocketContext) as SocketContextType;
  const { gl } = useThree();
  const cache = useMemo(() => ({
    lastFrame: Date.now(),
  }), []);

  const targetCanvas = useMemo(() => new OffscreenCanvas(1, 1), [])

  useEffect(() => {
    if (!downlink) return;

    const remove_handler = downlink.subscribe("GRAB_RENDER", ({
      key,
      rtype,
      data: { downsample = 1, quality = 1 }
    }: GrabRenderEvent) => {
      if (key !== _key) return;
      if (!gl.domElement) return;

      const { width, height } = gl.domElement;
      const now = Date.now();
      const delta = now - cache.lastFrame
      cache.lastFrame = now;

      const ctx = targetCanvas.getContext('2d');
      targetCanvas.width = width / downsample;
      targetCanvas.height = height / downsample;

      const canvas = gl.domElement;
      ctx.drawImage(canvas,
        0, 0, canvas.width, canvas.height,
        0, 0, targetCanvas.width, targetCanvas.height
      );

      targetCanvas.convertToBlob({ type: "image/jpeg", quality })
        .then((blob) => blob.arrayBuffer())
        .then((array) => {
          const payload = {
            etype: rtype || `GRAB_RENDER_RESPONSE`,
            key,
            value: {
              dpr,
              delta,
              width,
              height,
              frame: new Uint8Array(array),
            },
          };
          sendMsg(payload);
        });

    });

    return remove_handler;

  }, [ gl.domElement, sendMsg, downlink, uplink, cache ]);

  return null;

}
export default GrabRender;
