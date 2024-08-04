import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
} from 'react';
import { useStorage } from './hooks';
import { useAnimationFrame } from './hooks/useAnimationFrame';
import { Frame, Playback } from './playback';

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

export interface FullPlaybackState extends PlaybackState, TimelineState {}

export const PlaybackContext = createContext<Playback | null>(null);
export const PlaybackStateContext = createContext<PlaybackState | null>(null);
export const TimelineStateContext = createContext<TimelineState | null>(null);

interface Props extends PropsWithChildren {
  // Define the props for the provider
}

export const PlaybackProvider = ({ children }: Props = { children: [] }) => {
  const playback = useMemo(() => new Playback(), []);

  // console.log('PlaybackProvider is rendering.');

  // kickstart the rendering loop.
  useAnimationFrame(playback.render);

  return (
    <PlaybackContext.Provider value={playback}>
      {children}
    </PlaybackContext.Provider>
  );
};
export const PlaybackStateProvider = ({ children } = { children: [] }) => {
  const playback = useContext(PlaybackContext);
  const [state, setState, isLoaded] = useStorage<PlaybackState | {}>(
    'vuer-playback',
    {},
  );

  const [buffer, setBuffer] = useStorage<Frame[]>('vuer-frame-buffer', []);

  console.log('load: buffer', [buffer]);

  useEffect(() => {
    if (!playback) return;
    const { fps, speed, maxlen, recording, loop, paused } = (state ||
      {}) as unknown as PlaybackState;

    if (fps) playback.fps = fps;
    playback.speed = speed;
    // do not signal.
    playback.isRecording = recording;
    playback.loop = loop;
    playback.isPaused = paused;
    playback.changeBufferLength(maxlen);

    // allow clearing up the buffer;
    buffer?.length && playback.loadFrameBuffer(buffer);
  }, [playback]);

  useEffect(() => {
    const remove = playback.signal.on('UPDATE_STATE', () => {
      setState((prev) => ({
        ...prev,
        fps: playback.fps,
        speed: playback.speed,
        maxlen: playback.maxlen,

        recording: playback.isRecording,
        loop: playback.loop,
        paused: playback.isPaused,
      }));
    });
    return remove;
  }, [playback]);

  useEffect(() => {
    const remove = playback.signal.on('UPDATE_FRAME_BUFFER', () => {
      // setBuffer(playback.keyFrames.toArray());
    });
    return remove;
  }, [playback]);

  return (
    <PlaybackStateContext.Provider value={state as PlaybackState}>
      {children}
    </PlaybackStateContext.Provider>
  );
};
export const TimelineStateProvider = ({ children } = { children: [] }) => {
  const playback = useContext(PlaybackContext);
  const [state, setState, isLoaded] = useStorage<TimelineState | {}>(
    'vuer-timeline',
    {},
  );

  useEffect(() => {
    if (!playback) return;
    const { curr, start, end, rangeStart, rangeEnd } = (state ||
      {}) as unknown as TimelineState;

    playback.curr = curr;

    playback.start = start;
    playback.end = end;
    playback.range.start = rangeStart;
    playback.range.end = rangeEnd;
  }, [playback]);

  useEffect(() => {
    const remove = playback.signal.on('UPDATE_TIMELINE', () => {
      // console.log('setting states');
      setState((prev) => ({
        ...prev,
        curr: playback.curr,

        start: playback.start,
        end: playback.end,
        rangeStart: playback.range.start,
        rangeEnd: playback.range.end,
      }));
    });
    return remove;
  }, [playback]);

  return (
    <TimelineStateContext.Provider value={state as TimelineState}>
      {children}
    </TimelineStateContext.Provider>
  );
};

export const usePlayback = (): Playback => {
  const playback = useContext(PlaybackContext);
  if (!playback) {
    throw new Error('usePlayback must be used within a PlaybackProvider');
  }
  return playback;
};
export const usePlaybackStates = (): PlaybackState => {
  const playbackState = useContext<PlaybackState>(PlaybackStateContext);
  return playbackState || ({} as PlaybackState);
};

export const useTimelineStates = (): TimelineState => {
  const timelineState = useContext<TimelineState>(TimelineStateContext);
  return timelineState || ({} as TimelineState);
};
