import styles from './Timeline.module.scss';

import { Signal } from '@preact/signals';
import { useTimelineContext } from "./timeline_context";

interface PlayheadProps {
  seeking: Signal<number | null>;
  speed: number;
  frame: number;
}

export function Playhead({ seeking, speed, frame }: PlayheadProps) {
  const { framesToPixels } = useTimelineContext();
  // const { speed } = usePlayerState();
  // const time = usePlayerTime();
  // fixme: need to figure out what this does.
  // const frame = seeking.value ?? frame;

  return (
    <div
      className={styles.playhead}
      data-frame={formatFrames(frame, speed)}
      style={{
        left: `${framesToPixels(frame)}px`,
      }}
    />
  );
}

function formatFrames(frames: number, speed: number) {
  const round = speed % 1 === 0;
  if (round) {
    return frames;
  } else {
    return frames.toFixed(2);
  }
}
