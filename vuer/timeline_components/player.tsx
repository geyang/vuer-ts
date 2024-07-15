import { createContext, PropsWithChildren, useContext, useEffect, useMemo } from "react";
import { Deque } from "./collections";
import { Store } from "../html_components/store";
import { EventType } from "../interfaces";
import { useAnimationFrame } from "./hooks/useAnimationFrame";
import { useStorage } from "./hooks";

export type stateSetter<T> = (value: T | ((T) => T)) => void;

export interface Frame extends EventType {
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
  private _keyFrames: Deque<Frame>;
  store: Store<Frame>
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
    this._keyFrames = new Deque(keyFrames, maxlen);
    this.store = new Store()
    this.start = start;
    this.end = end;
    this.curr = end;

    this.isPaused = true;
    this.isRecording = true;
    this.loop = false;

    this.range = { start: rangeStart, end: rangeEnd } as Range
  }

  get keyFrames(): Deque<Frame> {
    return this._keyFrames;
  }

  setMaxlen = (maxlen: number) => {
    this._keyFrames = new Deque(this.keyFrames.toArray(), maxlen);
    if (this.keyFrames.size === 0) {
      this.start = this.end;
      this.curr = this.end;
      this.range.start = this.end;
      this.range.end = this.end;
    } else {
      this.start = this.end + 1 - this.keyFrames.size;
      this.range.start = Math.max(this.start, this.range.start);
      this.range.end = Math.min(this.end, this.range.end);
    }
  }

  get duration(): number {
    return this.keyFrames.size;
  }

  get progress(): number {
    // the progress is computed from the current selection.
    return 100 * (this.curr - this.range.start) / (this.range.end - this.range.start);
  }

  step(delta: number = 1): Frame {
    this.curr += delta;

    if (delta > 0) {
      // looping logic later.
      if (this.curr > this.range.end) {
        if (this.loop) this.curr = this.range.start;
        else {
          this.curr = this.range.end;
          if (this.keyFrames.size) this.isPaused = true;
        }
      }
      if (this.curr < this.range.start) {
        this.curr = this.range.start;
      }
    } else if (delta < 0) {
      if (this.curr < this.range.start) {
        if (this.loop) this.curr = this.range.end;
        else {
          this.curr = this.range.start;
          if (this.keyFrames.size) this.isPaused = true;
        }
      }
      if (this.curr > this.range.end) {
        this.curr = this.range.end;
      }
    }
    return this.currentFrame;
  }

  private deltaTime: number = 0;

  /**
   * onFrame callback, should be called inside useFrame
   * @param deltaTime
   */
  render = (deltaTime): void => {
    if (this.isPaused) return;

    this.deltaTime += deltaTime

    if (this.deltaTime < 1000 / this.fps) return;

    const frame = this.step(this.speed);
    // todo: only remove 1/ fps from ia book about two brothers who build subwayt
    this.deltaTime -= 1000 / this.fps;
    if (!!frame) this.store.publish(frame);
  }

  addKeyFrame = (frame: Frame) => {
    if (!this.isRecording) return;

    if (this.curr === this.end && this.keyFrames.size) this.curr += 1;
    if (this.range.end === this.end && this.keyFrames.size) this.range.end += 1;
    if (this.keyFrames.size) this.end += 1;

    this.keyFrames.push(frame);
    if ((this.end - this.start) >= this.keyFrames.maxlen) {
      if (this.range.start === this.start) this.range.start += 1;
      this.start += 1;
    }
    if (this.isPaused) this.store.publish(frame)
  }

  clear = () => {
    this.keyFrames.clear()
    this.start = this.end
    this.range.start = this.end
    this.range.end = this.end
  }

  seekNext = () => this.step()
  seekPrevious = () => this.step(-1)

  reset = () => {
    this.curr = this.range.start;
    this.store.publish(this.currentFrame)
  }
  seekEnd = () => {
    this.curr = this.range.end;
    this.store.publish(this.currentFrame)
  }

  emitSeek = (frame) => {
    this.curr = frame;
    this.store.publish(this.currentFrame)
  }

  get currentFrame(): Frame {
    return this.keyFrames.get(Math.round(this.curr) - this.start);
  }

  get firstFrame(): Frame {
    return this.keyFrames.get(0);
  }

  get lastFrame(): Frame {
    return this.keyFrames.get(this.keyFrames.size - 1);
  }

  setRange = ({ start, end }: RangeOption) => {
    if (typeof start === 'number') this.range.start = start;
    if (typeof end === 'number') this.range.end = end;
  }

  toggleRecording = () => {
    this.isRecording = !this.isRecording;
  }

  togglePlayback = () => {
    if (this.duration) this.isPaused = !this.isPaused;
    else this.isPaused = true;
    if (this.curr === this.range.end) this.curr = this.range.start;
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

  const playback = useMemo(() => new Playback(), [])

  useEffect(() => {
    // playback.isPaused = false;
  }, []);

  useAnimationFrame(playback.render);

  return (
    <PlaybackContext.Provider value={playback}>
      {children}
    </PlaybackContext.Provider>
  );
};

export interface PlaybackOption {
  fps?: number;
  speed?: number;
  maxlen?: number;
}

// eslint-disable-next-line react-refresh/only-export-components
export const usePlayback = ({ fps, speed, maxlen }: PlaybackOption = {}) => {
  const playback = useContext<Playback>(PlaybackContext);

  if (typeof fps === 'number') playback.fps = fps;
  if (typeof speed === 'number') playback.speed = speed;
  if (typeof maxlen === 'number') playback.setMaxlen(maxlen);

  if (!playback) {
    throw new Error('usePlayback must be used within a PlaybackProvider');
  }
  return playback;
}