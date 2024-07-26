import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
} from 'react';
import { useStorage } from './hooks';
import { useAnimationFrame } from './hooks/useAnimationFrame';
import { Playback } from './playback';

export interface TimelineState {
  curr: number;
  start: number;
  end: number;
  rangeStart: number;
  rangeEnd: number;
}

export interface PlaybackState {
  fps: number;
  speed: number;
  maxlen: number;
  recording: boolean;
  loop: boolean;
  paused: boolean;
}

export const PlaybackContext = createContext<Playback | null>(null);
export const PlaybackStateContext = createContext<PlaybackState | null>(null);
export const TimelineStateContext = createContext<TimelineState | null>(null);

interface Props extends PropsWithChildren {
  // Define the props for the provider
}

export const PlaybackProvider = ({ children }: Props) => {
  const playback = useMemo(() => new Playback(), []);

  console.log('PlaybackProvider is rendering.');

  // kickstart the rendering loop.
  useAnimationFrame(playback.render);

  return (
    <PlaybackContext.Provider value={playback}>
      {children}
    </PlaybackContext.Provider>
  );
};
export const PlaybackStateProvider = ({ children }) => {
  const playback = useContext(PlaybackContext);

  console.log('PlaybackStateProvider is rendering.');

  const [state, setState] = useStorage<PlaybackState | {}>('vuer-playback', {});

  useEffect(() => {
    const remove = playback.signal.on('UPDATE_STATE', () => {
      console.log('setting states');
      setState({
        fps: playback.fps,
        speed: playback.speed,
        maxlen: playback.maxlen,

        recording: playback.isRecording,
        loop: playback.loop,
        paused: playback.isPaused,
      });
    });
    return remove;
  });
  console.log('PlaybackState update is happening.');

  return (
    <PlaybackStateContext.Provider value={state as PlaybackState}>
      {children}
    </PlaybackStateContext.Provider>
  );
};
export const TimelineStateProvider = ({ children }) => {
  const playback = useContext(PlaybackContext);

  console.log('PlaybackStateProvider is rendering.');

  const [state, setState] = useStorage<TimelineState | {}>('vuer-playback', {});

  useEffect(() => {
    const remove = playback.signal.on('UPDATE_TIMELINE', () => {
      console.log('setting states');
      setState({
        curr: playback.curr,

        start: playback.start,
        end: playback.end,
        rangeStart: playback.range.start,
        rangeEnd: playback.range.end,
      });
    });
    return remove;
  });
  console.log('TimelineState update is happening.');

  return (
    <TimelineStateContext.Provider value={state as TimelineState}>
      {children}
    </TimelineStateContext.Provider>
  );
};

// export interface PlaybackOption {
//   fps?: number;
//   speed?: number;
//   maxlen?: number;
// }

export const usePlayback = (): Playback => {
  const playback = useContext(PlaybackContext);

  if (!playback) {
    throw new Error('usePlayback must be used within a PlaybackProvider');
  }

  return playback;
};
// This function will be transformed
export const usePlaybackStates = (): PlaybackState => {
  const playbackState = useContext<PlaybackState>(PlaybackStateContext);
  return playbackState;
};
export const useTimelineStates = (): TimelineState => {
  const timelineState = useContext<TimelineState>(TimelineStateContext);
  return timelineState;
};
