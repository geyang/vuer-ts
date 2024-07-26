import { useCallback } from 'react';
import { useThree } from '@react-three/fiber';
import { button, useControls } from 'leva';
import { ClientEvent, VuerProps } from '../vuer';
import { SocketContextType, useSocket } from '../vuer';

export function Download({ _key: key }: VuerProps) {
  const { sendMsg }: SocketContextType = useSocket();
  const { gl } = useThree();
  const callback = useCallback(() => {
    const uri = gl.domElement.toDataURL('image/png');
    sendMsg({ etype: 'SNAPSHOT', key, value: { screen: uri } } as ClientEvent);
    const link = document.createElement('a');
    link.setAttribute('download', 'canvas.png');
    link.setAttribute('href', uri.replace('image/png', 'image/octet-stream'));
    link.click();
  }, [sendMsg]);
  useControls(
    {
      'Take Screenshot': button(callback, { disabled: false }),
    },
    [],
  );

  return null;
}
