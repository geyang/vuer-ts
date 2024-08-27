import { clamp } from './utils';
import { ReactElement, useEffect, useRef, useState } from 'react';
import {
  containerStyle,
  primaryStyle,
  panelContainerStyle,
  panelStyle,
  shrunkStyle,
} from './resizableSwitch.module.scss';

interface ResizeableLayoutProps {
  _key?: string;
  style?: Record<string, string>;
  vertical?: boolean;
  hidden?: boolean;
  offset?: number;
  minOffset?: number;
  children: [ReactElement, ReactElement, ReactElement];
}

export function ResizableSwitch(
  {
    _key,
    style = {},
    children: [primary, panel, shrunkPanel],
    vertical = false,
    offset = 0,
    minOffset = 0,
    hidden = null,
  }: ResizeableLayoutProps) {
  const inverse = offset < 0;
  const containerRef = useRef<HTMLDivElement>(null);
  const [conf, setConf] = useState({
    size: inverse ? 1 : 0,
    isHidden: hidden,
  });
  const dimension = vertical ? 'width' : 'height';
  const axis: 'x' | 'y' = vertical ? 'x' : 'y';

  useEffect(() => {
    if (hidden !== null) setConf({ ...conf, isHidden: hidden });
  }, [hidden]);

  const primaryDimension = conf.isHidden
    ? `calc(100% - ${minOffset}px)`
    : `calc(${conf.size * 100}% - ${Math.abs(offset)}px)`;

  return (
    <div
      ref={containerRef}
      className={containerStyle}
      style={{ flexDirection: vertical ? 'row' : 'column', ...style }}
    >
      <div
        className={primaryStyle}
        style={{
          flexShrink: conf.isHidden ? 0 : 1,
          height: !vertical ? primaryDimension : '100%',
          width: vertical ? primaryDimension : '100%',
        }}
      >
        {primary}
      </div>
      <div
        className={panelContainerStyle}
        style={{
          width: vertical ? `16px` : `auto`,
          height: vertical ? `auto` : `16px`,
          cursor: vertical ? `ew-resize` : `ns-resize`,
          padding: vertical ? `0 7px` : `7px 0`,
          margin: vertical ? `0 -7px` : `-7px 0`,
          // ...(conf.isHidden && !vertical && { marginTop: '-9px' }),
          // ...(conf.isHidden && vertical && { marginRight: '-9px' }),
        }}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (!containerRef.current) return;
          if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            const rect = containerRef.current.getBoundingClientRect();
            const eventDim = event[axis] || event[`client${axis.toUpperCase()}`];
            const pixels = eventDim - rect[axis];
            const h = inverse
              ? pixels < -offset / 2
              : rect[dimension] - pixels < offset / 2;
            const d = inverse ? rect[dimension] - pixels : pixels;
            const percentage = clamp((d + Math.abs(offset)) / rect[dimension], 0, 1);
            setConf({ size: percentage, isHidden: h });
          }
        }}
        onPointerUp={(event) => {
          event.currentTarget.releasePointerCapture(event.pointerId);
        }}
      />
      {conf.isHidden ? (
        <div className={shrunkStyle}>{shrunkPanel}</div>
      ) : (
        <div className={panelStyle}>{panel}</div>
      )}
    </div>
  );
}
