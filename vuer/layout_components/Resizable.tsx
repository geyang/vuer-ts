import { clamp } from './utils';
import { ReactElement, useRef, useState } from 'react';
import { css } from '@emotion/react';
import {
  container,
  primary,
  resizable,
  resizableInner,
} from './resizable.module.scss';

interface ResizeableLayoutProps {
  _key?: string;
  vertical?: boolean;
  hidden?: boolean;
  offset?: number;
  children: [ReactElement, ReactElement];
}

export function Resizable({
  _key,
  children: [primary, panel],
  vertical = false,
  offset = 0,
  hidden = false,
}: ResizeableLayoutProps) {
  const inverse = offset < 0;
  const containerRef = useRef<HTMLDivElement>(null);
  const [conf, setConf] = useState({
    size: inverse ? 1 : 0,
    isHidden: hidden,
  });
  const dimension = vertical ? 'height' : 'width';
  const axis = vertical ? 'y' : 'x';

  const primaryDimension = conf.isHidden
    ? `100%`
    : `calc(${conf.size * 100}% + ${offset}px)`;

  return (
    <div
      ref={containerRef}
      className={container}
      style={{
        flexDirection: vertical ? `column` : `row`,
      }}
    >
      <div
        className={primary}
        style={{
          flexShrink: conf.isHidden ? 0 : 1,
          height: vertical ? primaryDimension : `100%`,
          width: !vertical ? primaryDimension : `100%`,
        }}
      >
        {primary}
      </div>
      <div
        className={resizable}
        style={{
          width: !vertical ? `16px` : `auto`,
          height: vertical ? `16px` : `auto`,
          cursor: vertical ? `ns-resize` : `ew-resize`,
          padding: vertical ? `7px 0` : `0 7px`,
          margin: vertical ? `-7px 0` : `0 -7px`,
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
      {conf.isHidden ? null : (
        <div
          className={resizableInner}
        >
          {panel}
        </div>
      )}
    </div>
  );
}
