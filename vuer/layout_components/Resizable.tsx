import { css } from '@emotion/react';
import { clamp } from './utils';
import { ReactElement, useRef, useState } from "react";

interface ResizeableLayoutProps {
  _key?: string;
  horizontal?: boolean;
  hidden?: boolean;
  offset?: number;
  children: [ ReactElement, ReactElement ];
}


export function Resizable({
  _key,
  children: [ primary, panel ],
  horizontal = false,
  offset = 0,
  hidden = false,
}: ResizeableLayoutProps) {
  const inverse = offset < 0;
  const containerRef = useRef<HTMLDivElement>();
  const [ conf, setConf ] = useState({ size: inverse ? 1 : 0, isHidden: hidden });
  const dimension = horizontal ? 'height' : 'width';
  const axis = horizontal ? 'y' : 'x';

  const primaryDimension = conf.isHidden
    ? `100%` :
    `calc(${conf.size * 100}% + ${offset}px)`;

  return (
    <div
      ref={containerRef}
      css={css`
          display: flex;
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
          justify-content: stretch;
          flex-direction: ${horizontal ? `column` : `row`};
      `}
    >
      <div css={css`
          flex-grow: 0;
          flex-shrink: ${conf.isHidden ? 0 : 1};
          overflow: hidden;
          height: ${horizontal ? primaryDimension : `100%`};
          width: ${!horizontal ? primaryDimension : `100%`};
      `}>
        {primary}
      </div>
      <div
        css={css`
            touch-action: none;
            width: ${!horizontal ? `16px` : `auto`};
            height: ${horizontal ? `16px` : `auto`};
            cursor: ${horizontal ? `ns-resize` : `ew-resize`};
            flex-shrink: 0;
            padding: ${horizontal ? `7px 0` : `0 7px`};
            margin: ${horizontal ? `-7px 0` : `0 -7px`};
            ${conf.isHidden && horizontal && `margin-top: -9px;`}
            ${conf.isHidden && !horizontal && `margin-right: -9px;`}
            z-index: 10000;

            :before {
                content: '';
                width: 100%;
                height: 100%;
                display: block;
                background-color: ${conf.isHidden ? `rgba(35, 170, 255, 0.21)` : `rgba(35, 170, 255, 0.21)`};
                z-index: 10000;
            }

            :hover:before {
                background-color: #23aaff;
            }

            :active:before {
                background-color: #23aaff !important;
            }
        `}
        onPointerDown={event => {
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={event => {
          if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            const rect = containerRef.current.getBoundingClientRect();
            const eventDim = event[axis] || event[`client${axis.toUpperCase()}`];
            const pixels = eventDim - rect[axis];
            const h = inverse
              ? rect[dimension] - pixels < -offset / 2
              : pixels < offset / 2;
            const percentage = clamp(0, 1, (pixels - offset) / rect[dimension]);
            setConf({ size: percentage, isHidden: h });
          }
        }}
        onPointerUp={event => {
          event.currentTarget.releasePointerCapture(event.pointerId);
        }}
      />
      {conf.isHidden ? null : <div css={css`
          flex-grow: 1;
          flex-shrink: 1;
          overflow: hidden;
      `}>{panel}</div>}
    </div>
  );
}
