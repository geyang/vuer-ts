import { usePlayback } from '../playback';
import { css } from '@emotion/react';
import { computed, Signal } from '@preact/signals-react';

interface CurrentTimeProps {
  title: string;
  time?: number;
  frame?: Signal<number>;
  frameTime?: Signal<number>;
  right?: boolean;

  [key: string]: unknown;
}

export function Timestamp({
  title = 'Current Time',
  frame,
  frameTime,
  right = false,
  ...rest
}: CurrentTimeProps) {
  const { playback } = usePlayback();

  let precision = 0;
  // let padding = playback.fps.toString().length;
  if (playback.speed.value % 1 !== 0) {
    precision = 2;
    // padding += 3;
  }
  const time = computed(() => frame.value / playback.fps.value);

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
          [{frame}]{/*[{frame.value.toFixed(precision)}]*/}
        </span>
      )}
      <span
        title={`${title} [HH:MM:SS:FF]`}
        css={css`
          margin: 0 8px;
          color: rgba(255, 255, 255, 0.32);
        `}
      >
        [{frameTime}]{/*{frameTime.value.toFixed(3)}*/}
      </span>
      {right && (
        <span
          css={css`
            color: rgba(255, 255, 255, 0.54);
          `}
        >
          [{frame}]{/*[{frame.value.toFixed(precision)}]*/}
        </span>
      )}
    </code>
  );
}
