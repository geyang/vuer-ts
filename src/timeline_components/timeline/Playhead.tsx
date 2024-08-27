import { playhead } from './Playhead.module.scss';

interface PlayheadProps {
  seeking: number;
  leftPos: number;
}

export function Playhead({ seeking, leftPos }: PlayheadProps) {
  return (
    <div
      data-seeking={seeking}
      className={playhead}
      style={{
        left: `calc(50% + ${leftPos}px)`,
      }}
    />
  );
}

function formatFrames(frames: number, speed: number) {
  const round = speed % 1 === 0;
  if (round) {
    return frames;
  } else {
    return frames.toFixed(2);
  }
}
