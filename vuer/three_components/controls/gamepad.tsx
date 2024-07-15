import { useContext } from 'react';
import { useGamepads } from 'react-gamepads';
import { VuerProps } from "../../vuer/interfaces";
import { SocketContext, SocketContextType } from "../../vuer/websocket";

export function Gamepad({ _key: key, children }: VuerProps) {
  const { sendMsg } = useContext(SocketContext) as SocketContextType;
  useGamepads((gamepads) => {
    const { axes, buttons } = gamepads[0] as Gamepad;
    sendMsg({
      etype: 'GAMEPADS',
      key,
      value: { axes, buttons: buttons.map((b) => b.value) },
    });
  });
  return <>{children}</>;
}
