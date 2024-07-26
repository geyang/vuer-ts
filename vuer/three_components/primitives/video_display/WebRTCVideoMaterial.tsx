import React, { useEffect } from 'react';
import { Vector2 } from 'three';
import { useVuerVideoTexture } from './useVuerVideoTexture';
import { useWebRTC } from './useWebRTC';
import { VuerProps } from '../../../vuer';
import { useVideo } from './useVuerVideo';

export type VideoMaterialProps = {
  src?: string | MediaStream;
  start?: boolean;
  side?: number;
  textureRepeat?: [number, number];
  textureOffset?: [number, number];
};

export function VideoMaterial({
  src,
  start,
  textureRepeat,
  textureOffset,
  ...rest
}: VideoMaterialProps) {
  const video = useVideo(src);
  const texture = useVuerVideoTexture(video, { start });

  useEffect(() => {
    if (textureRepeat) {
      texture.repeat = new Vector2(...textureRepeat);
    }
    if (textureOffset) {
      texture.offset = new Vector2(...textureOffset);
    }
  }, [textureRepeat, textureOffset]);

  if (!texture) return null;
  // @ts-ignore return type is not correct
  return <meshBasicMaterial map={texture} toneMapped={false} {...rest} />;
}

export type WebRTCVideoMaterialProps = VuerProps<{
  src: string;
  iceServer?: RTCIceServer;
  webRTCOptions?: RTCConfiguration;
}> &
  VideoMaterialProps;

export function WebRTCVideoMaterial({
  src,
  // This is a public STUN server provided by Google.
  iceServer = { urls: 'stun:stun.l.google.com:19302' },
  webRTCOptions: webRTCOptions,
  ...props
}: WebRTCVideoMaterialProps) {
  const srcObj: MediaStream = useWebRTC(src, { iceServer, ...webRTCOptions });

  if (!src || !srcObj) return;
  return <VideoMaterial src={srcObj} {...props} />;
}
