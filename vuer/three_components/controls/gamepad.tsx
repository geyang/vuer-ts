import { useGamepads } from 'react-gamepads';
import { ClientEvent, VuerProps } from '../../vuer';
import { SocketContextType, useSocket } from '../../vuer';

export function Gamepad({ _key: key, children }: VuerProps) {
  const { sendMsg } = useSocket() as SocketContextType;
  useGamepads((gamepads) => {
    const { axes, buttons } = gamepads[0] as Gamepad;
    sendMsg({
      ts: Date.now(),
      etype: 'GAMEPADS',
      key,
      value: { axes, buttons: buttons.map((b) => b.value) },
    } as ClientEvent);
  });
  return <>{children}</>;
}
