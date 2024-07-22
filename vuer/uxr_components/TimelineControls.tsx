import { button, useControls } from "leva";
import { useCallback, useContext, useEffect } from "react";
import { useSocket, SocketContextType } from "../vuer/websocket";
import { ClientEvent, VuerProps } from "../vuer/interfaces";
import { useThree } from "@react-three/fiber";

export type PlayBarProps = VuerProps<{
  start?: number;
  end?: number;
  play?: boolean;
}>;

export function TimelineControls({ _key: key, start = 0, end, stepSize = 1, play = false }: PlayBarProps) {

  const { sendMsg } = useSocket() as SocketContextType;
  /** note: we should probably use a different clock, because this would affect animations
   *    globally. */
  const { clock } = useThree();
  useEffect(() => play ? clock.start() : clock.stop(), [])

  const cb = useCallback((step) => {
    const event = {
      etype: "TIMELINE_STEP",
      key,
      value: {
        step: step,
        elapsedTime: clock.getElapsedTime(),
        delta: clock.getDelta()
      }
    } as ClientEvent
    // this would raise an error and kill the counter.
    try {
      sendMsg(event)
    } catch (e) {
      return;
    }

  }, []);

  const c = useControls("Timeline", {
    // @ts-ignore: there seems to be something wrong with the schema type.
    stepSize: { value: stepSize, min: -5, max: 10, step: 0.5 },
  }, []) as { stepSize: number }

  const [ ctrl, setControl ] = useControls("Timeline", () => {
    return {
      step: {
        value: 0,
        min: start,
        max: end,
        step: c.stepSize,
        onChange: (v) => {
          if (typeof v === "undefined") return;
          // setControl({ step: v })
          cb(v)
        },
        transient: false
      },
      frameRate: { value: 30, min: 1, max: 240, step: 1 },
      play: button(() => {
        if (clock.running) clock.stop();
        else clock.start()
      }, {
        // @ts-ignore: there seems to be something wrong with the button type.
        label: function () {
          return clock.running ? "Pause" : "Play";
        }
      })
    };
  }, [ c.stepSize ]);

  useEffect(() => {
    if (ctrl.frameRate <= 0) return;

    const id = setInterval(() => {
      if (clock.running) {
        ctrl.step += 1;
        setControl({ step: ctrl.step })
        cb(ctrl.step)
      }
    }, 1000 / ctrl.frameRate)
    return () => {
      clearInterval(id);
    }
  }, [ clock, ctrl, ctrl.frameRate ])


  return null;

}
