import {
  codeStyle,
  frameStyle,
  frameTimeStyle,
} from './CurrentTime.module.scss';

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
      className={codeStyle}
      style={{ textAlign: right ? 'right' : 'left' }}
      {...rest}
    >
      {!right && (
        <span className={frameStyle}>[{frame?.toFixed(precision)}]</span>
      )}
      <span title={`${title} [HH:MM:SS:FF]`} className={frameTimeStyle}>
        {frameTime?.toFixed(precision)}
      </span>
      {right && (
        <span className={frameStyle}>[{frame?.toFixed(precision)}]</span>
      )}
    </code>
  );
}
