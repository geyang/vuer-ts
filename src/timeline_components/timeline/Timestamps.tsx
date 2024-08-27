import { useMemo } from 'react';
import { tsStyle } from './Timestamps.module.scss';
import { Playback } from '../playback.tsx';

export interface TimestampsProps {
  start: number;
  end: number;
  firstVisibleFrame: number;
  lastVisibleFrame: number;
  segmentDensity?: number;
}

export function Timestamps({
  start,
  end,
  firstVisibleFrame,
  lastVisibleFrame,
  segmentDensity = 1,
}: TimestampsProps) {
  const timestamps = useMemo(() => {
    const timestamps = [];
    const clamped = Math.max(1, segmentDensity);
    const firstVisibleIndex =
      Math.floor((firstVisibleFrame - start) / clamped) * clamped + start;

    for (let i = firstVisibleIndex; i < lastVisibleFrame; i += clamped) {
      const visibleDuration = Math.max(end - start, 1);
      const isOdd =
        segmentDensity > 0 && ((i - start) / segmentDensity) % 2 !== 0;
      timestamps.push(
        <div
          key={i}
          data-label={isOdd ? '' : i}
          data-left={((i - start) / visibleDuration) * 100}
          className={tsStyle}
          style={{
            left: ((i - start) / visibleDuration) * 100 + `%`,
            opacity: isOdd ? 0.5 : 1,
          }}
        />,
      );
    }
    return timestamps;
  }, [firstVisibleFrame, lastVisibleFrame, segmentDensity]);

  return <>{timestamps}</>;
}
