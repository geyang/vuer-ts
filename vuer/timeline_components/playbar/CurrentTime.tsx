import { css } from '@emotion/react';

interface CurrentTimeProps {
  title: string;
  time?: number;
  frame?: number;
  frameTime?: number;
  right?: boolean;
  fps?: number;
  speed?: number;

  [key: string]: unknown;
}

export function Timestamp({
  title = 'Current Time',
  frame,
  frameTime,
  right = false,
  fps, speed,
  ...rest
}: CurrentTimeProps) {
  let precision = 0;
  // let padding = playback.fps.toString().length;
  if (speed % 1 !== 0) {
    precision = 2;
    // padding += 3;
  }
  const time = frame / fps;

  return (
    <code
      title={`${title} ${frame} ${time}`}
      css={css`
        height: 24px;
        padding: 0;
        background: transparent;
        text-align: right;
        text-align: ${right ? 'right' : 'left'};
      `}
      {...rest}
    >
      {!right && (
        <span
          css={css`
            color: rgba(255, 255, 255, 0.54);
          `}
        >
          [{frame}]
        </span>
      )}
      <span
        title={`${title} [HH:MM:SS:FF]`}
        css={css`
          margin: 0 8px;
          color: rgba(255, 255, 255, 0.32);
        `}
      >
        {frameTime}
      </span>
      {right && (
        <span
          css={css`
            color: rgba(255, 255, 255, 0.54);
          `}
        >
          [{frame}]
        </span>
      )}
    </code>
  );
}
