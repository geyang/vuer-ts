import { css } from '@emotion/react';
import { useMemo } from 'react';

const tsStyle = css`
  user-select: none;
  pointer-events: none;
  position: absolute;
  top: 32px;
  bottom: 0;
  border-left: 1px solid #0003;
  border-right: 1px solid #0003;
  width: 0;
  display: flex;
  justify-content: center;

  :after {
    font-family: var(--font-family-mono);
    font-size: var(--font-size-small);
    line-height: 32px;
    margin-top: -32px;
    text-align: center;
    color: rgba(255, 255, 255, 0.54);
    content: attr(data-label);
  }
`;

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
          css={tsStyle}
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
