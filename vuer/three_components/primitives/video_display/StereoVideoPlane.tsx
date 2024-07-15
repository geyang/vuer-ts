import React from "react";
import { HUDPlane, HUDPlaneProps } from "../../video_plane";
import { useVideo } from "./useVuerVideo";
import { useVuerVideoTexture } from "./useVuerVideoTexture";
import { useWebRTC } from "./useWebRTC";
import { VuerProps } from "../../../vuer/interfaces";


export type WebRTCStereoPlaneProps = VuerProps<{
  src: string;
  iceServer?: RTCIceServer;
  rtcOptions?: RTCConfiguration;
  crossOrigin?: string;
  muted?: boolean;
  loop?: boolean;
  start?: boolean;
  playsInline?: boolean;
  side?: number;
}> & HUDPlaneProps;

export const WebRTCStereoVideoPlane = ({
  src,
  // This is a public STUN server provided by Google.
  iceServer = { urls: 'stun:stun.l.google.com:19302' },
  side = 2,
  rtcOptions,
  crossOrigin = 'Anonymous',
  muted = true,
  loop = true,
  start = true,
  playsInline = true,
  ...props
}: WebRTCStereoPlaneProps) => {

  const srcObj = useWebRTC(src, { iceServer, ...rtcOptions });

  const video = useVideo(srcObj, { crossOrigin, muted, loop, start, playsInline })
  const leftTexture = useVuerVideoTexture(video, { repeat: [ 0.5, 1 ], offset: [ 0, 0 ] });
  const rightTexture = useVuerVideoTexture(video, { repeat: [ 0.5, 1 ], offset: [ 0.5, 0 ] });

  return <>
    <HUDPlane layers={1} {...props}>
      {leftTexture && <meshBasicMaterial map={leftTexture} toneMapped={false} side={2} {...props}/>}
    </HUDPlane>
    <HUDPlane layers={2} {...props}>
      {rightTexture && <meshBasicMaterial map={rightTexture} toneMapped={false} side={2} {...props}/>}
    </HUDPlane>
  </>
}

export type StereoPlaneProps = VuerProps<{
  src: string;
  side?: number;
  crossOrigin?: string;
  muted?: boolean;
  loop?: boolean;
  start?: boolean;
  playsInline?: boolean;
}> & HUDPlaneProps;

export const StereoVideoPlane = ({
  src,
  side = 2,
  crossOrigin = 'Anonymous',
  muted = true,
  loop = true,
  start = true,
  playsInline = true,
  ...props
}: StereoPlaneProps) => {

  const video = useVideo(src, {
    crossOrigin, muted, loop, start, playsInline
  });
  const leftTexture = useVuerVideoTexture(video, { repeat: [ 0.5, 1 ], offset: [ 0, 0 ] });
  const rightTexture = useVuerVideoTexture(video, { repeat: [ 0.5, 1 ], offset: [ 0.5, 0 ] });

  return <>
    <HUDPlane layers={1} {...props}>
      {leftTexture && <meshBasicMaterial map={leftTexture} toneMapped={false} side={2} {...props}/>}
    </HUDPlane>
    <HUDPlane layers={2} {...props}>
      {rightTexture && <meshBasicMaterial map={rightTexture} toneMapped={false} side={2} {...props}/>}
    </HUDPlane>
  </>
}
