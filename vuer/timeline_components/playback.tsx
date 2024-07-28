import { Deque } from './collections';
import { Store } from '../vuer/store';
import { EventType } from '../vuer/interfaces';
import { EventEmitter } from '../vuer/emitter';

export type stateSetter<T> = (value: T | ((T) => T)) => void;

export interface Frame extends EventType {
  ts: number;
  etype: string;
  data: unknown;
}

export class Range {
  start: number;
  end: number;

  constructor(start: number, end: number) {
    this.start = start;
    this.end = end;
  }
}

export interface RangeOption {
  start?: number | ((start: number) => number);
  end?: number | ((end: number) => number);
}

/**
 * Creates a method decorator that emits an event after the method's execution.
 *
 * The `sentinel` function is designed to enhance class methods in such a way that,
 * after a method's execution, an event of a specified type is emitted. This is particularly
 * useful for automatically triggering updates or notifications in response to method invocations.
 *
 * Usage:
 * To use, simply annotate a class method with `@sentinel('EVENT_TYPE')`, where 'EVENT_TYPE'
 * is the string identifier of the event you wish to emit after the method executes.
 *
 * ```typescript
 * import React from 'react';
 * import { sentinel, Playback } from './path/to/your/code';
 *
 * class VideoPlayer extends Playback {
 *   constructor() {
 *     super();
 *     // Initialize with default values or configurations
 *   }
 *
 *   @sentinel('PLAY')
 *   play() {
 *     console.log('Playing video...');
 *     // Logic to play video
 *   }
 *
 *   @sentinel('PAUSE')
 *   pause() {
 *     console.log('Pausing video...');
 *     // Logic to pause video
 *   }
 *
 *   @sentinel('STOP')
 *   stop() {
 *     console.log('Stopping video...');
 *     // Logic to stop video
 *   }
 * }
 *
 * // Example usage
 * const videoPlayer = new VideoPlayer();
 * videoPlayer.play(); // This will also emit a 'PLAY' event after executing
 * videoPlayer.pause(); // This will also emit a 'PAUSE' event after executing
 * videoPlayer.stop(); // This will also emit a 'STOP' event after executing
 * ```
 *
 * Note:
 * - The decorator expects the target class to have a `signal` property that is an instance of `EventEmitter`.
 * - It will log an error if attempted to be applied to a class property that is not a method.
 *
 *
 * @param etype The event type to emit after the method execution. This should be a string that uniquely identifies the event.
 * @returns A method decorator function that takes the target object, property key, and property descriptor as arguments,
 *          and modifies the method to emit an event upon completion.
 */

export function sentinel<
  This extends { signal: EventEmitter },
  Args extends any[],
  ReturnType,
>(etype: string) {
  function decorator(target, key, descriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function (this: This, ...args: Args): ReturnType {
      // console.log(`LOG: Entering method '${methodName}'.`);
      const result: ReturnType = originalMethod.call(this, ...args);
      // console.log(`LOG: Exiting method '${methodName}'.`);
      this.signal.emit(etype, {});
      return result;
    };

    return descriptor;
  }

  return decorator;
}

export class Playback {
  maxlen: number;
  fps: number;
  speed: number;
  start: number;
  end: number;
  curr: number;
  isPaused: boolean;
  isRecording: boolean;
  loop: boolean;

  private _keyFrames: Deque<Frame>;
  store: Store<Frame>;
  range: Range;

  signal: EventEmitter;

  /**
   * A Playback container for a sequence of keyframes
   *
   * @param maxlen {number} test this
   * @param speed {number} test this
   * @param fps {number} test this
   * @param keyFrames {Array<Frame>} test this
   * @param start {number} test this
   * @param end {number} test this
   * @param curr {number} test this
   * @param rangeStart {number} test this
   * @param rangeEnd {number} test this
   * @param pause {boolean} test this
   * @param loop {boolean} test this
   * @param record {boolean} test this
   * */
  constructor(
    maxlen: number = 100,
    fps: number = 60,
    speed: number = 1,
    keyFrames: Array<Frame> = [],
    start: number = 0,
    end: number = 0,
    curr: number = 0,
    rangeStart: number = 0,
    rangeEnd: number = 0,
    pause: boolean = true,
    loop: boolean = false,
    record: boolean = true,
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

    this._keyFrames = new Deque(keyFrames, maxlen);
    this.store = new Store();
    this.range = new Range(rangeStart, rangeEnd);

    this.signal = new EventEmitter();
  }

  get keyFrames(): Deque<Frame> {
    return this._keyFrames;
  }

  loadFrameBuffer(keyFrames: Frame[]) {
    this.maxlen = Math.max(this.maxlen, keyFrames.length);
    this._keyFrames = new Deque(
      keyFrames,
      this.maxlen
    );
  }

  changeBufferLength = (maxlen: number) => {
    this._keyFrames = new Deque(this.keyFrames.toArray(), maxlen);
    this.maxlen = maxlen;

  };

  // @sentinel<Playback, [number], void>('UPDATE_STATE')
  setMaxlen = (maxlen: number) => {
    this.changeBufferLength(maxlen);

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

    this.signal.emit('UPDATE_STATE', {});
    this.signal.emit('UPDATE_TIMELINE', {})
  };

  get duration(): number {
    return this.keyFrames.size;
  }

  get progress(): number {
    // the progress is computed from the current selection.
    return (
      (100 * (this.curr - this.range.start)) /
      (this.range.end - this.range.start)
    );
  }

  private step(delta: number = 1): Frame {
    const prev = this.curr;
    let curr = prev + delta;

    if (delta > 0) {
      if (curr > this.range.end) {
        if (this.loop) curr = this.range.start;
        else {
          curr = this.range.end;
          if (this.keyFrames.size) {
            this.isPaused = true;
            this.signal.emit('UPDATE_STATE', {});
          }
        }
      }
      if (curr < this.range.start) {
        curr = this.range.start;
      }
    } else if (delta < 0) {
      if (curr < this.range.start) {
        if (this.loop) curr = this.range.end;
        else {
          curr = this.range.start;
          if (this.keyFrames.size) this.isPaused = true;
        }
      }
      if (curr > this.range.end) {
        curr = this.range.end;
      }
    }

    // note: do not return a frame if the curr index has not changed.
    if (prev === curr || !this.keyFrames.size) return null;
    this.curr = curr;
    return this.currentFrame;
  }

  private deltaTime: number = 0;

  /**
   * onFrame callback, should be called inside useFrame
   * @param deltaTime
   */
  render = (deltaTime): void => {
    if (this.isPaused) return;

    this.deltaTime += deltaTime;

    if (this.deltaTime < 1000 / this.fps) return;

    const frame = this.step(this.speed);
    this.deltaTime -= 1000 / this.fps;

    if (!frame) return;

    this.store.publish(frame);
    this.signal.emit('UPDATE_TIMELINE', {});
  };

  // @sentinel<Playback, [Frame], void>('UPDATE_TIMELINE')
  addKeyFrame = (frame: Frame) => {
    if (!this.isRecording) return;

    if (this.curr === this.end && this.keyFrames.size) this.curr += 1;
    if (this.range.end === this.end && this.keyFrames.size) this.range.end += 1;
    if (this.keyFrames.size) this.end += 1;

    this.keyFrames.push(frame);
    if (this.end - this.start >= this.keyFrames.maxlen) {
      if (this.range.start === this.start) this.range.start += 1;
      this.start += 1;
    }
    this.signal.emit('UPDATE_TIMELINE', {});
    this.signal.emit('UPDATE_FRAME_BUFFER', {});
  };

  //@sentinel<Playback, [], void>('UPDATE_TIMELINE')
  clear = () => {
    this.keyFrames.clear();
    this.start = 0;
    this.end = 0;
    this.range.start = this.start;
    this.range.end = this.end;
    this.signal.emit('UPDATE_TIMELINE', {});
  };

  //@sentinel<Playback, [], void>('UPDATE_TIMELINE')
  seekNext = () => {
    this.step();
    this.store.publish(this.currentFrame);
    this.signal.emit('UPDATE_TIMELINE', {});
  };

  //@sentinel<Playback, [], void>('UPDATE_TIMELINE')
  seekPrevious = () => {
    this.step(-1);
    this.store.publish(this.currentFrame);
    this.signal.emit('UPDATE_TIMELINE', {});
  };

  //@sentinel<Playback, [], void>('UPDATE_TIMELINE')
  reset = () => {
    this.curr = this.range.start;
    this.store.publish(this.currentFrame);
    this.signal.emit('UPDATE_TIMELINE', {});
  };

  //@sentinel<Playback, [], void>('UPDATE_TIMELINE')
  seekEnd = () => {
    this.curr = this.range.end;
    this.store.publish(this.currentFrame);
    this.signal.emit('UPDATE_TIMELINE', {});
  };

  //@sentinel<Playback, [], void>('UPDATE_TIMELINE')
  emitSeek = (frame) => {
    this.curr = frame;
    this.store.publish(this.currentFrame);
    this.signal.emit('UPDATE_TIMELINE', {});
  };

  get currentFrame(): Frame {
    return this.keyFrames.get(Math.round(this.curr) - this.start);
  }

  get firstFrame(): Frame {
    return this.keyFrames.get(0);
  }

  get lastFrame(): Frame {
    return this.keyFrames.get(this.keyFrames.size - 1);
  }

  //@sentinel<Playback, [], void>('UPDATE_STATE')
  setFrameRate = (fps: number) => {
    console.log(this);
    this.fps = fps;
    this.signal.emit('UPDATE_STATE', {});
  };

  //@sentinel<Playback, [], void>('UPDATE_STATE')
  setSpeed = (speed: number) => {
    this.speed = speed;
    this.signal.emit('UPDATE_STATE', {});
  };

  //@sentinel<Playback, [], void>('UPDATE_TIMELINE')
  setRange = ({ start, end }: RangeOption) => {
    if (typeof start === 'number') this.range.start = start;
    if (typeof start === 'function') this.range.start = start(this.range.start);
    if (typeof end === 'number') this.range.end = end;
    if (typeof end === 'function') this.range.end = end(this.range.end);
    this.signal.emit('UPDATE_TIMELINE', {});
  };

  //@sentinel<Playback, [], void>('UPDATE_STATE')
  toggleRecording = () => {
    this.isRecording = !this.isRecording;
    // also stop the playback.
    this.isPaused = true;
    this.signal.emit('UPDATE_STATE', {});
  };

  //@sentinel<Playback, [], void>('UPDATE_STATE')
  togglePlayback = () => {
    const oldPaused = this.isPaused;
    const oldRecording = this.isRecording;

    if (this.isPaused) {
      this.isRecording = false;

      if (this.curr === this.range.end) {
        this.curr = this.range.start;
        this.store.publish(this.currentFrame);

        this.signal.emit('UPDATE_TIMELINE', {});

        if (this.loop) {
          this.isPaused = false;
        }
      } else {
        this.isPaused = false;
      }
    } else {
      this.isPaused = true;
    }

    if (oldPaused !== this.isPaused || oldRecording !== this.isRecording) {
      this.signal.emit('UPDATE_STATE', {});
    }
  };

  //@sentinel<Playback, [], void>('UPDATE_STATE')
  toggleLoop = () => {
    this.loop = !this.loop;
    this.signal.emit('UPDATE_STATE', {});
  };
}
