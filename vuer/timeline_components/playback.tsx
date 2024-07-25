import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
} from 'react';
import { Deque } from './collections';
import { Store } from '../vuer/store';
import { EventType } from '../vuer/interfaces';
import { useAnimationFrame } from './hooks/useAnimationFrame';
import {
  signal,
  Signal,
  computed,
  useSignal,
  useSignalEffect,
} from '@preact/signals-react';
import { useStorage } from './hooks';

export type stateSetter<T> = (value: T | ((T) => T)) => void;

export interface Frame extends EventType {
  ts: number;
  etype: string;
  data: unknown;
}

export class Range {
  start: Signal<number>;
  end: Signal<number>;

  constructor(start: Signal<number>, end: Signal<number>) {
    this.start = start;
    this.end = end;
    // this.start = signal(start);
    // this.end = signal(end);
  }
}

export interface RangeOption {
  start?: number | ((start: number) => number);
  end?: number | ((end: number) => number);
}

export interface PlaybackUpdateType {
  etype: string;
}

export class Playback {
  maxlen: Signal<number>;
  fps: Signal<number>;
  speed: Signal<number>;
  start: Signal<number>;
  end: Signal<number>;
  curr: Signal<number>;
  isPaused: Signal<boolean>;
  isRecording: Signal<boolean>;
  loop: Signal<boolean>;

  private _keyFrames: Deque<Frame>;
  store: Store<Frame>;
  range: Range;

  /**
   * A Playback container for a sequence of keyframes
   *
   * @param maxlen {Signal<number>} test this
   * @param speed {Signal<number>} test this
   * @param fps {Signal<number>} test this
   * @param keyFrames {Array<Frame>} test this
   * @param start {Signal<number>} test this
   * @param end {Signal<number>} test this
   * @param curr {Signal<number>} test this
   * @param rangeStart {Signal<number>} test this
   * @param rangeEnd {Signal<number>} test this
   * @param pause {Signal<boolean>} test this
   * @param loop {Signal<boolean>} test this
   * @param record {Signal<boolean>} test this
   * */
  constructor(
    maxlen: Signal<number>, // = 100,
    fps: Signal<number>, // = 60,
    speed: Signal<number>, // = 1,
    keyFrames: Array<Frame> = [],
    start: Signal<number>, // = 0,
    end: Signal<number>, // = 0,
    curr: Signal<number>, // = 0,
    rangeStart: Signal<number>, // = 0,
    rangeEnd: Signal<number>, // = 0,
    pause: Signal<boolean>,
    loop: Signal<boolean>,
    record: Signal<boolean>,
  ) {
    this.maxlen = maxlen;
    this.fps = fps;
    this.speed = speed;
    this.start = start;
    this.end = end;
    this.curr = curr;
    this.isPaused = pause;
    // this.isPaused = signal(false);
    this.isRecording = record;
    this.loop = loop;

    this._keyFrames = new Deque(keyFrames, maxlen.value);
    this.store = new Store();
    this.range = new Range(rangeStart, rangeEnd);
  }

  get keyFrames(): Deque<Frame> {
    return this._keyFrames;
  }

  setMaxlen = (maxlen: number) => {
    this._keyFrames = new Deque(this.keyFrames.toArray(), maxlen);
    this.maxlen.value = maxlen;

    if (this.keyFrames.size === 0) {
      this.start.value = this.end.value;
      this.curr.value = this.end.value;
      this.range.start.value = this.end.value;
      this.range.end.value = this.end.value;
    } else {
      this.start.value = this.end.value + 1 - this.keyFrames.size;
      this.range.start.value = Math.max(
        this.start.value,
        this.range.start.value,
      );
      this.range.end.value = Math.min(this.end.value, this.range.end.value);
    }
  };

  get duration(): number {
    return this.keyFrames.size;
  }

  get progress(): number {
    // the progress is computed from the current selection.
    return (
      (100 * (this.curr.value - this.range.start.value)) /
      (this.range.end.value - this.range.start.value)
    );
  }

  get isPlaying(): Signal<boolean> {
    return computed(() => !this.isPaused.value);
  }

  step(delta: number = 1): Frame {
    const prev = this.curr.value;
    let curr = prev + delta;

    if (delta > 0) {
      if (curr > this.range.end.value) {
        if (this.loop.value) curr = this.range.start.value;
        else {
          curr = this.range.end.value;
          if (this.keyFrames.size) this.isPaused.value = true;
        }
      }
      if (curr < this.range.start.value) {
        curr = this.range.start.value;
      }
    } else if (delta < 0) {
      if (curr < this.range.start.value) {
        if (this.loop.value) curr = this.range.end.value;
        else {
          curr = this.range.start.value;
          if (this.keyFrames.size) this.isPaused.value = true;
        }
      }
      if (curr > this.range.end.value) {
        curr = this.range.end.value;
      }
    }

    // note: do not return a frame if the curr index has not changed.
    if (prev === curr || !this.keyFrames.size) return null;
    this.curr.value = curr;
    return this.currentFrame;
  }

  private deltaTime: number = 0;

  /**
   * onFrame callback, should be called inside useFrame
   * @param deltaTime
   */
  render = (deltaTime): void => {
    if (this.isPaused.value) return;

    this.deltaTime += deltaTime;

    if (this.deltaTime < 1000 / this.fps.value) return;

    const frame = this.step(this.speed.value);
    this.deltaTime -= 1000 / this.fps.value;

    if (!frame) return;

    this.store.publish(frame);
  };

  addKeyFrame = (frame: Frame) => {
    if (!this.isRecording.value) return;

    if (this.curr.value === this.end.value && this.keyFrames.size)
      this.curr.value += 1;
    if (this.range.end.value === this.end.value && this.keyFrames.size)
      this.range.end.value += 1;
    if (this.keyFrames.size) this.end.value += 1;

    this.keyFrames.push(frame);
    if (this.end.value - this.start.value >= this.keyFrames.maxlen) {
      if (this.range.start.value === this.start.value)
        this.range.start.value += 1;
      this.start.value += 1;
    }
  };

  clear = () => {
    this.keyFrames.clear();
    this.start.value = this.end.value;
    this.range.start.value = this.end.value;
    this.range.end.value = this.end.value;
  };

  seekNext = () => {
    this.step();
    this.store.publish(this.currentFrame);
  };

  seekPrevious = () => {
    this.step(-1);
    this.store.publish(this.currentFrame);
  };

  reset = () => {
    this.curr.value = this.range.start.value;
    this.store.publish(this.currentFrame);
  };

  seekEnd = () => {
    this.curr.value = this.range.end.value;
    this.store.publish(this.currentFrame);
  };

  emitSeek = (frame) => {
    this.curr.value = frame;
    this.store.publish(this.currentFrame);
  };

  get currentFrame(): Frame {
    return this.keyFrames.get(Math.round(this.curr.value) - this.start.value);
  }

  get firstFrame(): Frame {
    return this.keyFrames.get(0);
  }

  get lastFrame(): Frame {
    return this.keyFrames.get(this.keyFrames.size - 1);
  }

  setRange = ({ start, end }: RangeOption) => {
    if (typeof start === 'number') this.range.start.value = start;
    if (typeof start === 'function')
      this.range.start.value = start(this.range.start.value);
    if (typeof end === 'number') this.range.end.value = end;
    if (typeof end === 'function')
      this.range.end.value = end(this.range.end.value);
  };

  toggleRecording = () => {
    this.isRecording.value = !this.isRecording.value;
    // also stop the playback.
    this.isPaused.value = true;
  };

  togglePlayback = () => {
    // console.log('togglePlayback', this.isPaused.value);

    // if the history is empty this is always paused.
    if (!this.duration) this.isPaused.value = true;

    if (this.curr.value === this.range.end.value) {
      this.curr.value = this.range.start.value;
      this.store.publish(this.currentFrame);
    } else this.isPaused.value = !this.isPaused.value;
  };

  toggleLoop = () => {
    // console.log('toggleLoop', this.loop.value);
    this.loop.value = !this.loop.value;
  };
}

export interface PlaybackContextType {
  playback: Playback;
  fps: number;
  speed: number;
  maxlen: number;

  curr: number;

  start: number;
  end: number;
  rangeStart: number;
  rangeEnd: number;

  recording: boolean;
  loop: boolean;
  paused: boolean;
}

export const PlaybackContext = createContext<PlaybackContextType | null>(null);

interface Props extends PropsWithChildren {
  // Define the props for the provider
}

export const PlaybackProvider = ({ children }: Props) => {
  const maxlen = useSignal(100);
  const fps = useSignal(60);
  const speed = useSignal(1);
  const start = useSignal(0);
  const end = useSignal(0);
  const curr = useSignal(0);
  const rangeStart = useSignal(0);
  const rangeEnd = useSignal(0);
  const pause = useSignal(false);
  const loop = useSignal(false);
  const record = useSignal(false);

  const playback = useMemo(
    () =>
      new Playback(
        maxlen,
        fps,
        speed,
        [],
        start,
        end,
        curr,
        rangeStart,
        rangeEnd,
        pause,
        loop,
        record,
      ),
    [],
  );

  const [state, setState] = useStorage<
    Omit<PlaybackContextType, 'playback'> | {}
  >('vuer-playback', {});

  useSignalEffect(() => {
    // console.log('useSignalEffect', playback.curr.value);
    setState({
      fps: playback.fps.value,
      speed: playback.speed.value,
      maxlen: playback.maxlen.value,

      curr: playback.curr.value,

      start: playback.start.value,
      end: playback.end.value,
      rangeStart: playback.range.start.value,
      rangeEnd: playback.range.end,

      recording: playback.isRecording.value,
      loop: playback.loop.value,
      paused: playback.isPaused.value,
    });
  });
  // console.log('this is happening');

  useAnimationFrame(playback.render);

  return (
    <PlaybackContext.Provider
      value={{ playback, ...state } as PlaybackContextType}
    >
      {children}
    </PlaybackContext.Provider>
  );
};

export interface PlaybackOption {
  fps?: number;
  speed?: number;
  maxlen?: number;
}

// This function will be transformed
/** @useSignals */
export const usePlayback = ({
  fps,
  speed,
  maxlen,
}: PlaybackOption = {}): PlaybackContextType => {
  const { playback, ...rest } =
    useContext<PlaybackContextType>(PlaybackContext);

  useEffect(() => {
    if (fps) playback.fps.value = fps;
    if (speed) playback.speed.value = speed;
    if (maxlen) playback.setMaxlen(maxlen);
  }, [fps, speed, maxlen]);

  if (!playback) {
    throw new Error('usePlayback must be used within a PlaybackProvider');
  }

  return { playback, ...rest };
};
