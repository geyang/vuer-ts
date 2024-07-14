import styles from './Timeline.module.scss';

import { Signal } from '@preact/signals';
import { useTimelineContext } from "./timeline_context";
import { css } from "@emotion/react";
import { start } from "node:repl";

interface PlayheadProps {
  // seeking: Signal<number | null>;
  seeking: number;
  leftPos: number;
  // start: number;
  // duration?: number;
  // offset: number;
  // fullWidth: number;
}

const PlayheadStyle = css`
    position: absolute;
    width: 0;
    border-left: 1px solid var(--theme);
    margin-left: -50%;
    border-box: content-box;
    top: 6px;
    bottom: 0;
    background-color: var(--theme);
    pointer-events: none;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    margin-left: -50%;

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
    }`;

export function Playhead({ seeking, leftPos }: PlayheadProps) {

  // const leftPos = (seeking - start) / duration * fullWidth;

  return (
    <div
      data-seeking={seeking}
      data-left={leftPos}
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
