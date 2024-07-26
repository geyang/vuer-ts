import { useEffect, useState } from 'react';
import { negotiate_webrtc } from './webrtc_negotiation';

export const DEFAULT_ICE_SERVER: RTCIceServer = {
  urls: 'stun:stun.l.google.com:19302',
};

export type WebRTCOptions = {
  // we allow passing just one instance of iceServer
  iceServer?: RTCIceServer;
} & RTCConfiguration;

export function useWebRTC(
  src: string,
  { iceServer = DEFAULT_ICE_SERVER, iceServers = [], ...rest }: WebRTCOptions,
) {
  const [srcObj, setSrc] = useState(null);

  useEffect(() => {
    const servers = !!iceServer ? [iceServer, ...iceServers] : iceServers;

    const peer = new RTCPeerConnection({
      iceServers: servers,
      ...rest,
    });
    peer.addEventListener('track', (evt) => {
      if (evt.track.kind == 'video') setSrc(evt.streams[0]);
    });

    const offer = negotiate_webrtc(peer, src);

    // close the connection on destroy.
    return () => peer.close();
  }, [src]);

  return srcObj as MediaStream;
}