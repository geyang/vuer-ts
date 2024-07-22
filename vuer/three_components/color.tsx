import { useContext, useEffect, useMemo } from 'react';
import { useControls } from 'leva';
import queryString from 'query-string';
import { useSocket } from "../vuer/websocket";
import { ClientEvent } from "../vuer/interfaces";

interface BackgroundColorProps {
  levaPrefix?: string;
  color?: string;
}

type BackgroundQueries = {
  background?: string;
  lightBg?: string;
  darkBg?: string;
}

const preferredTheme = () => window?.matchMedia?.('(prefers-color-scheme:dark)')?.matches ? 'dark' : 'light';

type CameraMoveEvent = ClientEvent<{ world: {world: string } }>

export function BackgroundColor({ levaPrefix = 'Scene', color = '#181818' }: BackgroundColorProps) {
  const queries = useMemo(() => queryString.parse(document.location.search), [ document.location.search ]) as BackgroundQueries;
  const bgColor = useMemo<string>((): string | undefined => {

    let dark, light;
    if (queries.background) {
      [ dark, light ] = queries.background.split(',');
    }
    if (queries.darkBg) dark = queries.darkBg;
    if (queries.lightBg) light = queries.lightBg;

    const theme = preferredTheme();

    let localColor;
    if (theme === "dark") localColor = dark || light;
    else if (theme === "light") localColor = light || dark;
    else console.warn("Unknown theme", theme);

    return localColor ? `#${localColor}` : color;

  }, [ color, document.location.search ]);

  const { background } = useControls(
    levaPrefix,
    {
      background: {
        value: bgColor,
        label: 'Background Color',
      },
    },
    { collapsed: true },
    [ color ],
  );
  const { uplink } = useSocket();
  useEffect(
    () => uplink.addReducer('CAMERA_MOVE', ({
      value: { world, ..._value }, ..._event
    }: CameraMoveEvent) =>
      // console.log("CAMERA_MOVE-reducer-once", event);
      ({
        ..._event,
        value: {
          ..._value,
          world: { ...(world as object), background },
        },
      })),
    [ uplink, background ],
  );

  return <color attach="background" args={[ background ]}/>;
}
