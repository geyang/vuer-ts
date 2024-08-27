import { DragIndicator } from '../icons';
import { RefObject, useCallback, useContext, useEffect, useState } from 'react';
import { MouseButton } from './mouse_interfaces';
import { Playback, stateSetter } from '../playback';
import { clamp } from '../../layout_components/utils';
import {
  container,
  style,
  rangeStyle,
  dragIndStyle,
} from './RangeSelector.module.scss';

export interface RangeSelectorProps {
  rangeRef: RefObject<HTMLDivElement>;
  // duration is different from end - start. It mismatches by 1.
  rangeStart: number;
  rangeEnd: number;
  viewWidth: number;
  playback: Playback;
}

export function RangeSelector({ rangeRef, viewWidth, playback }: RangeSelectorProps) {

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
    <div className={container}>
      <div
        ref={rangeRef}
        className={rangeStyle}
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
        <div className={style} />
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
      className={dragIndStyle}
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
