import { css } from '@emotion/react';

const codeStyle = css`
  height: 24px;
  padding: 0;
  background: transparent;
`;

const frameStyle = css`
  color: rgba(255, 255, 255, 0.54);
`;

const frameTimeStyle = css`
  margin: 0 8px;
  color: rgba(255, 255, 255, 0.32);
`;

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
  fps,
  speed,
  ...rest
}: CurrentTimeProps) {
  const precision = speed % 1 !== 0 ? 2 : 0;
  const time = frame / fps;

  return (
    <code
      title={`${title} ${frame} ${time}`}
      css={codeStyle}
      style={{ textAlign: right ? 'right' : 'left' }}
      {...rest}
    >
      {!right && <span css={frameStyle}>[{frame?.toFixed(precision)}]</span>}
      <span title={`${title} [HH:MM:SS:FF]`} css={frameTimeStyle}>
        {frameTime?.toFixed(precision)}
      </span>
      {right && <span css={frameStyle}>[{frame?.toFixed(precision)}]</span>}
    </code>
  );
}
