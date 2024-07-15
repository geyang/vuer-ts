import { DragIndicator } from '../icons';
import { RefObject, useCallback, useEffect, useState } from "react";
import { MouseButton } from "./mouse_interfaces";
import { useKeyHold } from "../hooks";
import { css } from "@emotion/react";
import { RangeOption, stateSetter, usePlayback } from "../player";
import { clamp } from "../../layout_components/utils";
import { start } from "node:repl";

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
  rangeStart: number;
  rangeEnd: number;
  viewWidth: number;
}

const style = css`
    flex-grow: 1;
    flex-shrink: 1;
`

export function RangeSelector({
  rangeRef,
  viewWidth,
}: RangeSelectorProps) {
  const player = usePlayback();

  const [ rStart, setLocalStart ] = useState(player.range.start);
  const [ rEnd, setLocalEnd ] = useState(player.range.end);

  useEffect(() => {
    setLocalStart(player.range.start)
  }, [ player.range.start ])

  useEffect(() => {
    setLocalEnd(player.range.end)
  }, [ player.range.end ])

  const setStart = useCallback((start: number) => {
    player.setRange({ start })
    setLocalStart(start)
  }, [ player ])

  const setEnd = useCallback((end: number) => {
    player.setRange({ end })
    setLocalEnd(end)
  }, [ player ])

  console.log(player)

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
          left: `${(rStart - player.start) / (player.end - player.start) * 100}%`,
          right: `${(player.duration + player.end - rEnd) % player.duration / (player.end - player.start) * 100}%`
        }}
      >
        {/*(start: number) => selectRange({ start, end: rangeEnd } as RangeOption)}*/}
        {/*onChange={(end: number) => selectRange({ start: rangeStart, end } as RangeOption)}*/}
        <RangeHandle
          onChange={setStart}
          roundUp
          start={player.start}
          end={player.end}
          viewWidth={viewWidth}
        />
        <div css={style}/>
        <RangeHandle
          onChange={setEnd}
          roundUp
          start={player.start}
          end={player.end}
          viewWidth={viewWidth}
        />
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
