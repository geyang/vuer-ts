import { css } from '@emotion/react';

interface PlayheadProps {
  seeking: number;
  leftPos: number;
}

const PlayheadStyle = css`
  position: absolute;
  width: 0;
  border-left: 1px solid var(--theme);
  margin-left: -50%;
  box-sizing: content-box;
  top: 6px;
  bottom: 0;
  background-color: var(--theme);
  pointer-events: none;
  display: flex;
  align-items: flex-start;
  justify-content: center;

  //transition-duration: 1s;

  :before {
    display: block;
    padding: 0 4px;
    border-radius: var(--radius);
    background-color: var(--theme);
    font-family: var(--font-family-mono);
    font-size: var(--font-size-small);
    line-height: 20px;
    font-weight: bold;
    color: #000000;
  }

  :before {
    content: attr(data-seeking);
  }
`;

export function Playhead({ seeking, leftPos }: PlayheadProps) {
  return (
    <div
      data-seeking={seeking}
      css={PlayheadStyle}
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
