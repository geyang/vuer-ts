import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo, useState,
} from 'react';
import { useStorage } from './hooks';
import { useAnimationFrame } from './hooks/useAnimationFrame';
import { Frame, Playback } from './playback';

export interface PlaybackValue {
  playback: Playback;
}

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

export const PlaybackContext = createContext<Playback | null>(null!);
export const PlaybackStateContext = createContext<PlaybackState | null>(null!);
export const TimelineStateContext = createContext<TimelineState | null>(null!);

export const PlaybackProvider = ({ children }: PropsWithChildren) => {

  const [playback, setPlayback] = useState<Playback>(null!);

  useEffect(() => {
    setPlayback(new Playback());
    return () => {
      console.log('cleanup');
      setPlayback(null);
    };
  }, []);

  // kickstart the rendering loop.
  useAnimationFrame(playback?.render);

  return (
    <PlaybackContext.Provider value={playback}>
      {children}
    </PlaybackContext.Provider>
  );
};

export const usePlayback = (): Playback => useContext(PlaybackContext);

export const PlaybackStateProvider = ({ children }: PropsWithChildren) => {
  const playback = usePlayback();
  // const [state, setState, isLoaded] = useStorage<PlaybackState | {}>(
  //   'vuer-playback',
  //   {},
  // );
  const [state, setState] = useState<PlaybackState>();

  const [buffer, setBuffer] = useStorage<Frame[]>('vuer-frame-buffer', []);

  console.log('load: buffer', buffer);

  // useEffect(() => {
  //   if (!playback) return;
  //   const { fps, speed, maxlen, recording, loop, paused } = (state ||
  //     {}) as unknown as PlaybackState;
  //
  //   if (fps) playback.fps = fps;
  //   playback.speed = speed;
  //   // do not signal.
  //   playback.isRecording = recording;
  //   playback.loop = loop;
  //   playback.isPaused = paused;
  //   playback.changeBufferLength(maxlen);
  //
  //   // allow clearing up the buffer;
  //   buffer?.length && playback.loadFrameBuffer(buffer);
  // }, [playback]);

  useEffect(() => {
    if (!playback) return;
    setState({
      fps: playback.fps,
      speed: playback.speed,
      maxlen: playback.maxlen,
      recording: playback.isRecording,
      loop: playback.loop,
      paused: playback.isPaused,
    });
    const remove = playback.signal.on('UPDATE_STATE', () => {
      setState((prev: PlaybackState) => ({
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
    if (!playback) return;
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

export const usePlaybackStates = (): PlaybackState =>
  useContext(PlaybackStateContext);

export const TimelineStateProvider = ({ children }: PropsWithChildren) => {
  const playback = usePlayback();
  // const [state, setState, isLoaded] = useStorage<TimelineState | {}>(
  //   'vuer-timeline',
  //   {},
  // );
  const [state, setState] = useState<TimelineState>();

  // useEffect(() => {
  //   if (!playback) return;
  //   const { curr, start, end, rangeStart, rangeEnd } = (state ||
  //     {}) as unknown as TimelineState;
  //
  //   playback.curr = curr;
  //
  //   playback.start = start;
  //   playback.end = end;
  //   playback.range.start = rangeStart;
  //   playback.range.end = rangeEnd;
  // }, [playback]);

  useEffect(() => {
    if (!playback) return;
    setState({
      curr: playback.curr,
      start: playback.start,
      end: playback.end,
      rangeStart: playback.range.start,
      rangeEnd: playback.range.end,
    });

    const remove = playback.signal.on('UPDATE_TIMELINE', () => {
      setState((prev: TimelineState) => ({
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

  // console.log('timeline state', state, playback);

  return (
    <TimelineStateContext.Provider value={state as TimelineState}>
      {children}
    </TimelineStateContext.Provider>
  );
};


export const useTimelineStates = (): TimelineState =>
  useContext(TimelineStateContext);
