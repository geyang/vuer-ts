export function negotiate_webrtc(pc: RTCPeerConnection, src: string) {
  pc.addTransceiver('video', { direction: 'recvonly' });
  pc.addTransceiver('audio', { direction: 'recvonly' });

  return pc.createOffer().then((offer) => {
    return pc.setLocalDescription(offer);
  }).then(() => {
    // wait for ICE gathering to complete
    return new Promise<void>((resolve): void => {
      if (pc.iceGatheringState === 'complete') {
        resolve();
      } else {
        const checkState = (): void => {
          if (pc.iceGatheringState === 'complete') {
            pc.removeEventListener('icegatheringstatechange', checkState);
            resolve();
          }
        };
        pc.addEventListener('icegatheringstatechange', checkState);
      }
    });
  }).then(() => {
    const offer = pc.localDescription as RTCSessionDescription;
    return fetch(src, {
      body: JSON.stringify({
        sdp: offer.sdp,
        type: offer.type,
      }),
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST'
    });
  }).then((response) => {
    return response.json();
  }).then((answer) => {
    return pc.setRemoteDescription(answer);
  }).catch((e) => {
    alert(e);
  });
}