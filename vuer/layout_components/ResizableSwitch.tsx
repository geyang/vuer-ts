import { css } from '@emotion/react';
import { clamp } from './utils';
import { ReactElement, useRef, useState } from 'react';

interface ResizeableLayoutProps {
  _key?: string;
  vertical?: boolean;
  hidden?: boolean;
  offset?: number;
  minOffset?: number;
  children: [ReactElement, ReactElement, ReactElement];
}

export function ResizableSwitch({
  _key,
  children: [primary, panel, shrunkPanel],
  vertical = false,
  offset = 0,
  minOffset = 0,
  hidden = false,
}: ResizeableLayoutProps) {
  const inverse = offset < 0;
  const containerRef = useRef<HTMLDivElement>();
  const [conf, setConf] = useState({ size: inverse ? 1 : 0, isHidden: hidden });
  const dimension = vertical ? 'height' : 'width';
  const axis = vertical ? 'y' : 'x';

  const primaryDimension = conf.isHidden
    ? `calc(100% - ${minOffset}px)`
    : `calc(${conf.size * 100}% + ${offset}px)`;

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
        flex-direction: ${vertical ? `column` : `row`};
      `}
    >
      <div
        css={css`
          flex-grow: 0;
          flex-shrink: ${conf.isHidden ? 0 : 1};
          overflow: hidden;
          height: ${vertical ? primaryDimension : `100%`};
          width: ${!vertical ? primaryDimension : `100%`};
        `}
      >
        {primary}
      </div>
      <div
        css={css`
          touch-action: none;
          width: ${!vertical ? `16px` : `auto`};
          height: ${vertical ? `16px` : `auto`};
          cursor: ${vertical ? `ns-resize` : `ew-resize`};
          flex-shrink: 0;
          padding: ${vertical ? `7px 0` : `0 7px`};
          margin: ${vertical ? `-7px 0` : `0 -7px`};
          ${conf.isHidden && vertical && `margin-top: -9px;`}
          ${conf.isHidden && !vertical && `margin-right: -9px;`}
            z-index: 10;

          user-select: none;

          :before {
            content: '';
            width: 100%;
            height: 100%;
            display: block;
            background-color: ${conf.isHidden
              ? `rgba(35, 170, 255, 0.21)`
              : `rgba(35, 170, 255, 0.21)`};
            z-index: 10000;
          }

          :hover:before {
            background-color: #23aaff;
          }

          :active:before {
            background-color: #23aaff !important;
          }
        `}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            const rect = containerRef.current.getBoundingClientRect();
            const eventDim =
              event[axis] || event[`client${axis.toUpperCase()}`];
            const pixels = eventDim - rect[axis];
            const h = inverse
              ? rect[dimension] - pixels < -offset / 2
              : pixels < offset / 2;
            const percentage = clamp((pixels - offset) / rect[dimension], 0, 1);
            setConf({ size: percentage, isHidden: h });
          }
        }}
        onPointerUp={(event) => {
          event.currentTarget.releasePointerCapture(event.pointerId);
        }}
      />
      {conf.isHidden ? (
        <div
          css={css`
            flex-grow: 1;
            flex-shrink: 1;
            overflow: hidden;
            user-select: none;
          `}
        >
          {shrunkPanel}
        </div>
      ) : (
        <div
          css={css`
            flex-grow: 1;
            flex-shrink: 1;
            overflow: hidden;
            user-select: none;
          `}
        >
          {panel}
        </div>
      )}
    </div>
  );
}
