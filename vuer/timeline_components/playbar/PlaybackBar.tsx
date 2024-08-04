import { PlaybackControls } from './PlaybackControls';
import { Timestamp } from './CurrentTime';

import {
  usePlayback,
  usePlaybackStates,
  useTimelineStates,
} from '../playbackHooks';

import style from './PlaybackBar.module.scss';

export interface PlaybackBarProps {}

/**
 * note: this is now moved into the App itself, to avoid dependency on the Socket connection.
 * const { downlink } = useSocket();
 *
 * ```typescript
 * useEffect(() => {
 *   const cancel = [
 *     downlink.subscribe("SET", playback.addKeyFrame),
 *     downlink.subscribe("ADD", playback.addKeyFrame),
 *     downlink.subscribe("UPDATE", playback.addKeyFrame),
 *     downlink.subscribe("UPSERT", playback.addKeyFrame),
 *   ]
 *
 *   return () => {
 *     cancel.forEach(f => f());
 *   }
 * }, [ playback, downlink ])
 * ```
 */
export const PlaybackBar = ({}: PlaybackBarProps) => {
  const playback = usePlayback();
  const { fps, speed } = usePlaybackStates();
  const { start, end, rangeStart, rangeEnd } = useTimelineStates();

  console.log(playback.progress);

  return (
    <div data-progress={playback.progress} className={style.PlaybackBarStyle}>
      <Timestamp
        title='Current time'
        frame={rangeStart}
        frameTime={(rangeStart - start) / fps}
        fps={fps}
        speed={speed}
      />
      <PlaybackControls />
      <Timestamp
        title='Duration'
        frame={rangeEnd}
        frameTime={(rangeEnd - start) / fps}
        right
        fps={fps}
        speed={speed}
      />
    </div>
  );
};
