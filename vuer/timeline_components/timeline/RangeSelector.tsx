// import { labelClipDraggingLeftSignal } from '../../signals';
import { DragIndicator } from '../icons';
import { RefObject, useCallback, useEffect, useState } from "react";
import { useTimelineContext } from "./timeline_context";
import { MouseButton } from "./mouse_interfaces";
import { useKeyHold } from "../hooks";
import { css } from "@emotion/react";
import { RangeOption, stateSetter } from "../player";
import { clamp } from "../../layout_components/utils";
import { useControls } from "leva";
import { min } from "three/examples/jsm/nodes/shadernode/ShaderNodeBaseElements";

export interface RangeSelectorProps {
  rangeRef: RefObject<HTMLDivElement>;
  fps: number;
  duration: number;
  start: number;
  end: number;
  rangeStart: number;
  rangeEnd: number;

  selectRange: stateSetter<RangeOption>;
  viewWidth: number;
}

function framesToSeconds(step: number) {
  return step / 30;
}

function secondsToFrames(time: number) {
  return time * 30;
}

export function RangeSelector({
  rangeRef,
  fps,
  duration,
  start, end,
  rangeStart,
  rangeEnd,
  selectRange,
  viewWidth,
}: RangeSelectorProps) {
  const { pixelsToFrames, framesToPercents, pointerToFrames } =
    useTimelineContext();
  // const { range } = useSharedSettings();
  // const [ range, setRange ] = useState([ 0, 0, 0, 0 ]);
  // const startFrame = secondsToFrames(range[0]);
  // const endFrame = Math.min(secondsToFrames(range[1]), duration);
  const [ rStart, setStart ] = useState(rangeStart);
  const [ rEnd, setEnd ] = useState(rangeEnd);
  const shiftHeld = useKeyHold('Shift');
  const controlHeld = useKeyHold('Control');

  useEffect(() => setStart(rangeStart), [ rangeStart ])
  useEffect(() => setEnd(rangeEnd), [ rangeEnd ])

  useEffect(() => {
    selectRange({ start: rStart, end: rEnd })
  }, [ rStart, rEnd ]);

  return (
    <div
      css={css`
          height: 32px;
          cursor: pointer;
          width: 100%;
      `}
    >
      <div
        ref={rangeRef}
        css={css`
            border-radius: var(--radius);
            cursor: move;
            position: absolute;
            height: 32px;
            background-color: var(--surface-color);
            border: 2px solid var(--surface-color-light);
            display: flex;
            align-items: center;
            justify-content: center;
            pointer-events: ${shiftHeld ? `auto` : `none`};
            border-color: ${shiftHeld && !controlHeld ? `rgba(255, 255, 255, 0.24)` : `rgba(255, 255, 255, 0.12)`};

            max-width: 100%;
            left: ${(rStart - start) / duration * 100}%;
            right: ${(duration + end - rEnd) % duration / duration * 100}%;
        `}
      >
        <RangeHandle onChange={setStart} roundUp start={start} end={end} viewWidth={viewWidth}/>
        <div css={css`flex-grow: 1;
            flex-shrink: 1;`}/>
        <RangeHandle onChange={setEnd} roundUp start={start} end={end} viewWidth={viewWidth}/>
      </div>
    </div>
  );
}

interface RangeHandleProps {
  onChange?: stateSetter<number>;
  start: number;
  end: number;
  roundUp?: boolean;
  viewWidth: number;
}

function RangeHandle({ onChange, start, end, viewWidth, roundUp = false }: RangeHandleProps) {
  const shiftHeld = useKeyHold('Shift');
  // opacity: ${shiftHeld ? 0.24 : 0};
  // z-index: ${shiftHeld ? 1 : 'auto'};
  // min-width: ${shiftHeld ? 24 : 0}px;

  return (
    <DragIndicator
      css={css`
          cursor: pointer;
          margin-top: 2px;
          color: white;
          opacity: 0.1;
          z-index: auto;
          min-width: 0;

          :hover {
              opacity: 0.24;
              z-index: 1;
              min-width: 24px;
          }

          :active {
              opacity: 1;
              cursor: ew-resize;
          }
      `}
      onPointerDown={event => {
        if (event.button === MouseButton.Left) {
          event.preventDefault();
          event.stopPropagation();
          event.currentTarget.setPointerCapture(event.pointerId);
        }
      }}
      onPointerMove={event => {
        if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
        event.stopPropagation();

        const frames = event.movementX / viewWidth * (end - start);

        onChange(value => {
          console.log("old value", value, "new value", clamp(value + frames, start, end))
          return clamp(value + frames, start, end)
        });
      }}
      onPointerUp={event => {
        if (event.button !== MouseButton.Left) return;
        event.stopPropagation();
        event.currentTarget.releasePointerCapture(event.pointerId);

        const frames = event.movementX / viewWidth * (end - start);

        onChange(value => {
          const newValue = clamp(value + frames, start, end)
          return roundUp ? Math.round(newValue) : newValue;
        });
      }}
    />
  );
}
