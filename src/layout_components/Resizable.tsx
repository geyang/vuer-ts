import { clamp } from './utils';
import { ReactElement, useEffect, useRef, useState } from 'react';
import {
  container,
  primaryStyle,
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

export function Resizable(
  {
    _key,
    children: [mainPanel, secondaryPanel],
    vertical = false,
    offset = 0,
    hidden = false,
  }: ResizeableLayoutProps) {
  const inverse = offset < 0;
  const containerRef = useRef<HTMLDivElement>(null);
  const [conf, setConf] = useState({
    size: inverse ? 1 : 1,
    isHidden: hidden,
  });
  const dimension = vertical ? 'width' : 'height';
  const axis: 'x' | 'y' = vertical ? 'x' : 'y';

  useEffect(() => {
    if (hidden !== null) setConf({ ...conf, isHidden: hidden });
  }, [hidden]);

  const primaryDimension = conf.isHidden
    ? `100%`
    : `calc(${conf.size * 100}% - ${Math.abs(offset)}px)`;

  console.log('conf.isHidden', conf.isHidden);

  const secondary = conf.isHidden
    ? null
    : <div className={resizableInner}>
      {secondaryPanel}
    </div>;
  const main = (
    <div
      className={primaryStyle}
      style={{
        flexShrink: conf.isHidden ? 0 : 1,
        height: !vertical ? primaryDimension : `100%`,
        width: vertical ? primaryDimension : `100%`,
      }}
    >
      {mainPanel}
    </div>
  );

  console.log('conf.isHidden', conf.isHidden);

  return (
    <div
      ref={containerRef}
      className={container}
      style={{
        flexDirection: vertical ? `row` : `column`,
      }}
    >
      {!inverse ? main : secondary}
      <div
        className={resizable}
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
          const tgt = event.currentTarget as HTMLElement;
          if (!containerRef?.current) return;

          if (tgt.hasPointerCapture(event.pointerId)) {
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
      {!inverse ? secondary : main}
    </div>
  );
}
