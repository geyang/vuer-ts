import { createContext, PropsWithChildren, useContext, useMemo } from "react";

interface Frame {
  time_stamp: number;
  frame: number;
  data: unknown;
}

export class Playback {
  fps: number;
  startFrame: number;
  endFrame: number;
  keyFrames: Frame[];
  currStep: number;

  // status
  isPaused: boolean;
  loop: boolean

  constructor(fps: number, startFrame: number, endFrame: number, keyFrames: any[]) {
    this.fps = fps;
    this.startFrame = startFrame;
    this.endFrame = endFrame;
    this.keyFrames = keyFrames;
    this.currStep = 0;
  }

  step(delta: number = 1): Frame {
    /**
     * Simple query by step
     */
    this.currStep += delta;
    if (this.currStep > this.endFrame) {
      this.currStep = this.endFrame;
    }
    return this.keyFrames[this.currStep];
  }
}

export const PlaybackContext = createContext<Playback | null>(null);

interface Props extends PropsWithChildren {
  // Define the props for the provider
}

export const PlaybackProvider = ({ children }: Props) => {

  const playback = useMemo(() => {
    return new Playback(24, 0, 100, []);
  }, [])

  return (
    <PlaybackContext.Provider value={playback}>
      {children}
    </PlaybackContext.Provider>
  );
};

export const usePlayback = () => {
  const playback = useContext<Playback>(PlaybackContext);
  if (!playback) {
    throw new Error('usePlayback must be used within a PlaybackProvider');
  }
  return playback;
}