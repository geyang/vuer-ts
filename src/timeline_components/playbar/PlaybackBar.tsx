import {
  usePlayback,
  usePlaybackStates,
  useTimelineStates,
} from '../playbackHooks';
import { PlaybackControls } from './PlaybackControls';
import { Timestamp } from './CurrentTime';

import { playbackBar, progressBar } from './PlaybackBar.module.scss';


export interface PlaybackBarProps {
};

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
  const ps = usePlaybackStates();
  const ts = useTimelineStates();

  if (!ps || !ts) return null;

  const { fps, speed, paused, maxlen, recording, loop } = ps;
  const { start, end, rangeStart, rangeEnd } = ts;

  return (
    <div className={playbackBar}>
      <Timestamp
        title="Current time"
        frame={rangeStart}
        frameTime={(rangeStart - start) / fps}
        fps={fps}
        speed={speed}
      />
      <PlaybackControls
        playback={playback}
        maxlen={maxlen}
        speed={speed}
        paused={paused}
        loop={loop}
        recording={recording}
      />
      <Timestamp
        title="Duration"
        frame={rangeEnd}
        frameTime={(rangeEnd - start) / fps}
        right
        fps={fps}
        speed={speed}
      />
      <div className={progressBar} style={{width: `${playback.progress || 0}%` }}/>
    </div>
  );
};
