import styles from './Resizable.module.scss';
import { clamp } from './utils';
import { ReactElement, useRef, useState } from "react";
import clsx from 'clsx';

interface ResizeableLayoutProps {
  _key: string;
  vertical?: boolean;
  hidden: boolean;
  offset?: number;
  children: [ ReactElement, ReactElement ];
}

export function Resizable({
  _key,
  children: [ primary, sizable ],
  vertical = false,
  offset = 0,
  hidden = false,
}: ResizeableLayoutProps) {
  const inverse = offset < 0;
  const containerRef = useRef<HTMLDivElement>();
  const [ conf, setConf ] = useState({ size: inverse ? 1 : 0, isHidden: hidden });
  const dimension = vertical ? 'height' : 'width';
  const axis = vertical ? 'y' : 'x';

  return (
    <div
      ref={containerRef}
      className={clsx(styles.root, {
        [styles.vertical]: vertical,
        [styles.hidden]: conf.isHidden,
      })}
    >
      <div
        className={styles.primary}
        style={{
          [dimension]: conf.isHidden
            ? undefined
            : `calc(${offset}px + ${conf.size * 100}%)`,
        }}
      >
        {primary}
      </div>
      <div
        className={styles.separator}
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
      {conf.isHidden ? null : <div className={styles.resizable}>{sizable}</div>}
    </div>
  );
}
