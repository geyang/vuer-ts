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

const containerStyle = css`
  display: flex;
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  justify-content: stretch;
`;

const primaryStyle = css`
  flex-grow: 0;
  overflow: hidden;
`;

const panelContainerStyle = css`
  touch-action: none;
  flex-shrink: 0;
  z-index: 10;

  user-select: none;

  :before {
    content: '';
    width: 100%;
    height: 100%;
    display: block;
    background-color: rgba(35, 170, 255, 0.21);
    z-index: 10000;
  }

  :hover:before {
    background-color: #23aaff;
  }

  :active:before {
    background-color: #23aaff !important;
  }
`;

const shrunkStyle = css`
  flex-grow: 1;
  flex-shrink: 1;
  overflow: hidden;
  user-select: none;
`;

const panelStyle = css`
  flex-grow: 1;
  flex-shrink: 1;
  overflow: hidden;
  user-select: none;
`;

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
      css={containerStyle}
      style={{ flexDirection: vertical ? 'column' : 'row' }}
    >
      <div
        css={primaryStyle}
        style={{
          flexShrink: conf.isHidden ? 0 : 1,
          height: vertical ? primaryDimension : '100%',
          width: !vertical ? primaryDimension : '100%',
        }}
      >
        {primary}
      </div>
      <div
        css={panelContainerStyle}
        style={{
          width: !vertical ? '16px' : 'auto',
          height: vertical ? '16px' : 'auto',
          cursor: vertical ? 'ns-resize' : 'ew-resize',
          flexShrink: 0,
          padding: vertical ? '7px 0' : '0 7px',
          margin: vertical ? '-7px 0' : '0 -7px',
          ...(conf.isHidden && vertical && { marginTop: '-9px' }),
          ...(conf.isHidden && !vertical && { marginRight: '-9px' }),
        }}
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
        <div css={shrunkStyle}>{shrunkPanel}</div>
      ) : (
        <div css={panelStyle}>{panel}</div>
      )}
    </div>
  );
}
