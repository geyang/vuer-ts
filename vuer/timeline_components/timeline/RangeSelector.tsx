import styles from './Timeline.module.scss';

import clsx from 'clsx';
// import { labelClipDraggingLeftSignal } from '../../signals';
import { DragIndicator } from '../icons';
import { RefObject, useCallback, useEffect, useState } from "react";
import { useTimelineContext } from "./timeline_context";
import { MouseButton } from "./mouse_interfaces";
import { useKeyHold } from "../hooks";

export interface RangeSelectorProps {
  rangeRef: RefObject<HTMLDivElement>;
  fps: number;
  duration: number;
}

function framesToSeconds(step: number) {
  return step / 30;
}

function secondsToFrames(time: number) {
  return time * 30;
}

export function RangeSelector({ rangeRef, fps, duration}: RangeSelectorProps) {
  const { pixelsToFrames, framesToPercents, pointerToFrames } =
    useTimelineContext();
  // const { range } = useSharedSettings();
  const [ range, setRange ] = useState([ 0, 0, 0, 0 ]);
  const startFrame = secondsToFrames(range[0]);
  const endFrame = Math.min(secondsToFrames(range[1]), duration);
  const [ start, setStart ] = useState(startFrame);
  const [ end, setEnd ] = useState(endFrame);
  const shiftHeld = useKeyHold('Shift');
  const controlHeld = useKeyHold('Control');

  const onDrop = useCallback(() => {
    // labelClipDraggingLeftSignal.value = null;
    setRange([ start, end, duration, fps ]);
  }, [ start, end, duration, fps ]);

  useEffect(() => {
    setStart(startFrame);
    setEnd(endFrame);
  }, [ startFrame, endFrame, range[0], range[1] ]);

  let normalizedStart = start;
  let normalizedEnd = end;
  if (start > end) {
    normalizedStart = end;
    normalizedEnd = start;
  }

  return (
    <div
      className={clsx(
        styles.rangeTrack,
        shiftHeld && controlHeld && styles.active,
      )}
      onPointerDown={event => {
        if (event.button === MouseButton.Left) {
          event.preventDefault();
          event.stopPropagation();
          event.currentTarget.setPointerCapture(event.pointerId);

          setStart(pointerToFrames(event.clientX));
          setEnd(pointerToFrames(event.clientX));
        }
      }}
      onPointerMove={event => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          setEnd(end + pixelsToFrames(event.movementX));
        }
      }}
      onPointerUp={event => {
        if (event.button === MouseButton.Left) {
          event.currentTarget.releasePointerCapture(event.pointerId);
          onDrop();
        }
      }}
    >
      <div
        ref={rangeRef}
        style={{
          flexDirection: start > end ? 'row-reverse' : 'row',
          left: `${framesToPercents(Math.ceil(Math.max(0, normalizedStart)))}%`,
          right: `${
            100 - framesToPercents(Math.ceil(Math.min(duration, normalizedEnd)))
          }%`,
        }}
        className={clsx(
          styles.range,
          shiftHeld && !controlHeld && styles.active,
        )}
        onPointerDown={event => {
          if (event.button === MouseButton.Left) {
            event.preventDefault();
            event.stopPropagation();
            event.currentTarget.setPointerCapture(event.pointerId);
          }
        }}
        onPointerMove={event => {
          if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            setStart(start + pixelsToFrames(event.movementX));
            setEnd(end + pixelsToFrames(event.movementX));
          }
        }}
        onPointerUp={event => {
          if (event.button === MouseButton.Left) {
            event.currentTarget.releasePointerCapture(event.pointerId);
            onDrop();
          }
        }}
        onDoubleClick={() => {
          setRange([ 0, Infinity, duration, fps ]);
        }}
      >
        <RangeHandle value={start} setValue={setStart} onDrop={onDrop}/>
        <div className={styles.handleSpacer}/>
        <RangeHandle value={end} setValue={setEnd} onDrop={onDrop}/>
      </div>
    </div>
  );
}

interface RangeHandleProps {
  value: number;
  setValue: (value: number) => void;
  onDrop: (event: PointerEvent) => void;
}

function RangeHandle({ value, setValue, onDrop }: RangeHandleProps) {
  const { pixelsToFrames } = useTimelineContext();

  return (
    <DragIndicator
      className={styles.handle}
      onPointerDown={event => {
        if (event.button === MouseButton.Left) {
          event.preventDefault();
          event.stopPropagation();
          event.currentTarget.setPointerCapture(event.pointerId);
          // labelClipDraggingLeftSignal.value = framesToSeconds(value);
        }
      }}
      onPointerMove={event => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.stopPropagation();
          const newValue = value + pixelsToFrames(event.movementX);
          setValue(newValue);
          // labelClipDraggingLeftSignal.value = framesToSeconds(newValue);
        }
      }}
      onPointerUp={event => {
        if (event.button === MouseButton.Left) {
          event.stopPropagation();
          event.currentTarget.releasePointerCapture(event.pointerId);
          // onDrop(event);
        }
      }}
    />
  );
}
