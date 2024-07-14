import { createContext, PropsWithChildren, useContext, useMemo } from "react";
import { Deque } from "./collections";

export type stateSetter<T> = (value: T | ((T) => T)) => void;

export interface Frame {
  ts: number;
  etype: string;
  data: unknown;
}

export interface Range {
  start: number;
  end: number;
}


export interface RangeOption {
  start?: number;
  end?: number;
}

export class Playback {
  fps: number;
  speed: number;
  start: number;
  end: number;
  range: Range;
  keyFrames: Deque<Frame>;
  curr: number;

  // status
  isPaused: boolean;
  isRecording: boolean;
  loop: boolean

  /**
   * A Playback container for a sequence of keyframes
   *
   * @param maxlen {number} test this
   * @param speed {number} test this
   * @param fps {number} test this
   * @param keyFrames {Array<Frame>} test this
   * @param start {number} test this
   * @param end {number} test this
   * @param rangeStart {number} test this
   * @param rangeEnd {number} test this
   * */
  constructor(
    maxlen: number = 100,
    speed: number = 1,
    fps: number = 60,
    keyFrames: Array<Frame> = [],
    start: number = 0,
    end: number = 0,
    rangeStart: number = 0,
    rangeEnd: number = 0,
  ) {
    this.fps = fps;
    this.speed = speed
    this.keyFrames = new Deque(keyFrames, maxlen);
    this.start = start;
    this.end = end;
    this.curr = end;

    this.isPaused = true;
    this.isRecording = true;
    this.loop = false;

    this.range = { start: rangeStart, end: rangeEnd } as Range
  }

  get duration(): number {
    return this.keyFrames.size;
  }

  step(delta: number = 1): Frame {
    /**
     * Simple query by step
     */
    this.curr += delta;
    // looping logic later.
    // if (this.curr > this.end) {
    //   this.curr = this.end;
    // }
    return this.keyFrames[this.curr];
  }

  addKeyFrame = (frame: Frame) => {
    if (!this.isRecording) {
      return;
    }

    this.keyFrames.push(frame);
    if (this.curr === this.end) this.curr += 1;
    if (this.range.end === this.end) this.range.end += 1;
    this.end += 1;
    // console.log(this.end, this.keyFrames)
    if (this.end >= this.keyFrames.maxlen) {
      if (this.range.start === this.start) this.range.start += 1;
      this.start += 1;
    }
  }

  requestNextFrame = () => {
    this.curr += 1;
  }

  requestPreviousFrame = () => {
    this.curr -= 1;
  }
  requestReset = () => {
    this.curr = this.range.start;
  }
  requestSeek = (time) => {
    // todo: not implemented
    this.curr = this.range.end;
  }

  emitSeek = (frame) => {
    this.curr = frame;
  }

  get lastFrame(): Frame {
    return this.keyFrames[this.keyFrames.size - 1];
  }

  setRange = ({ start, end }: RangeOption) => {
    if (typeof start === 'number') this.range.start = start;
    if (typeof end === 'number') this.range.end = end;
    console.log(this.range)
  }

  toggleRecording = () => {
    this.isRecording = !this.isRecording;
  }

  togglePlayback = () => {
    this.isPaused = !this.isPaused;
  }

  toggleLoop = () => {
    this.loop = !this.loop;
  }

}

export const PlaybackContext = createContext<Playback | null>(null);

interface Props extends PropsWithChildren {
  // Define the props for the provider
}

export const PlaybackProvider = ({ children }: Props) => {

  const playback = useMemo(() => {
    return new Playback();
  }, [])

  return (
    <PlaybackContext.Provider value={playback}>
      {children}
    </PlaybackContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const usePlayback = () => {
  const playback = useContext<Playback>(PlaybackContext);
  if (!playback) {
    throw new Error('usePlayback must be used within a PlaybackProvider');
  }
  return playback;
}