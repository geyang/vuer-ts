import { DragIndicator } from '../icons';
import { RefObject, useCallback, useEffect, useState } from 'react';
import { MouseButton } from './mouse_interfaces';
import { useKeyHold } from '../hooks';
import { css } from '@emotion/react';
import {
  RangeOption,
  stateSetter,


} from '../playback';
import { clamp } from '../../layout_components/utils';
import { start } from 'node:repl';
import { usePlayback, usePlaybackStates } from "../playbackHooks";

const rangeStyle = css`
  border-radius: var(--radius);
  cursor: move;
  position: absolute;
  height: 32px;
  background-color: rgba(36, 36, 36, 0);
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
`;

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
`;

export function RangeSelector({ rangeRef, viewWidth }: RangeSelectorProps) {
  const playback = usePlayback();

  const [rStart, setLocalStart] = useState(playback.range.start);
  const [rEnd, setLocalEnd] = useState(playback.range.end);

  useEffect(() => {
    setLocalStart(playback.range.start);
  }, [playback.range.start]);

  useEffect(() => {
    setLocalEnd(playback.range.end);
  }, [playback.range.end]);

  const setStart = useCallback(
    (start: number) => {
      playback.setRange({ start });
      setLocalStart(start);
    },
    [playback],
  );

  const setEnd = useCallback(
    (end: number) => {
      playback.setRange({ end });
      setLocalEnd(end);
    },
    [playback],
  );

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
          left: `${((rStart - playback.start) / (playback.end - playback.start)) * 100}%`,
          right: `${(((playback.duration + playback.end - rEnd) % playback.duration) / (playback.end - playback.start)) * 100}%`,
        }}
      >
        {/*(start: number) => selectRange({ start, end: rangeEnd } as RangeOption)}*/}
        {/*onChange={(end: number) => selectRange({ start: rangeStart, end } as RangeOption)}*/}
        <RangeHandle
          onChange={setStart}
          roundUp
          start={playback.start}
          end={playback.end}
          viewWidth={viewWidth}
        />
        <div css={style} />
        <RangeHandle
          onChange={setEnd}
          roundUp
          start={playback.start}
          end={playback.end}
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

function RangeHandle({
  onChange,
  start,
  end,
  viewWidth,
  roundUp = false,
}: RangeHandleProps) {
  return (
    <DragIndicator
      css={css`
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
      onPointerDown={(event) => {
        if (event.button === MouseButton.Left) {
          event.preventDefault();
          event.stopPropagation();
          event.currentTarget.setPointerCapture(event.pointerId);
        }
      }}
      onPointerMove={(event) => {
        if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
        event.stopPropagation();

        const frames = (event.movementX / viewWidth) * (end - start);

        onChange((value) => {
          // console.log("old value", value, "new value", clamp(value + frames, start, end))
          return clamp(value + frames, start, end);
        });
      }}
      onPointerUp={(event) => {
        if (event.button !== MouseButton.Left) return;
        event.stopPropagation();
        event.currentTarget.releasePointerCapture(event.pointerId);

        const frames = (event.movementX / viewWidth) * (end - start);

        onChange((value) => {
          const newValue = clamp(value + frames, start, end);
          return roundUp ? Math.round(newValue) : newValue;
        });
      }}
    />
  );
}
