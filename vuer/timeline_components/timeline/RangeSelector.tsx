import { DragIndicator } from '../icons';
import { RefObject, useEffect, useState } from "react";
import { MouseButton } from "./mouse_interfaces";
import { useKeyHold } from "../hooks";
import { css } from "@emotion/react";
import { RangeOption, stateSetter } from "../player";
import { clamp } from "../../layout_components/utils";

const rangeStyle = css`
    border-radius: var(--radius);
    cursor: move;
    position: absolute;
    height: 32px;
    background-color: rgba(36, 36, 36, 0.0);
    border: 2px solid rgba(255, 255, 255, 0.24);
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: auto;
    max-width: 100%;

    opacity: 0.4;

    :hover {
        opacity: 0.8;
    }
`

export interface RangeSelectorProps {
  rangeRef: RefObject<HTMLDivElement>;
  // duration is different from end - start. It mismatches by 1.
  duration: number;
  start: number;
  end: number;
  rangeStart: number;
  rangeEnd: number;

  selectRange: stateSetter<RangeOption>;
  viewWidth: number;
}

export function RangeSelector({
  rangeRef,
  duration,
  start, end,
  rangeStart,
  rangeEnd,
  selectRange,
  viewWidth,
}: RangeSelectorProps) {
  const [ rStart, setStart ] = useState(rangeStart);
  const [ rEnd, setEnd ] = useState(rangeEnd);

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
        css={rangeStyle}
        style={{
          left: `${(rStart - start) / (end - start) * 100}%`,
          right: `${(duration + end - rEnd) % duration / (end - start) * 100}%`
        }}
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
          
          opacity: 0.5;
          z-index: auto;
          min-width: 0;

          cursor: ew-resize;

          :hover {
              opacity: 0.9;
              z-index: 1;
              min-width: 24px;
          }

          :active {
              opacity: 1;
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
          // console.log("old value", value, "new value", clamp(value + frames, start, end))
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
