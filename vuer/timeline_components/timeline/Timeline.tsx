import {
  useLayoutEffect,
  useRef,
  WheelEvent,
  PointerEvent,
  useState,
  useEffect,
} from 'react';
import { css } from '@emotion/react';
import { Timestamps } from './Timestamps';
import { RangeSelector } from './RangeSelector';
import {
  PlaybackOption,
  RangeOption,
  stateSetter,
  usePlayback,
} from '../playback';
import { Playhead } from './Playhead';
import { useSize, useStorage } from '../hooks';
import { MouseButton, MouseMask } from './mouse_interfaces';
import { clamp } from '../../layout_components/utils';

const ZOOM_SPEED = 0.000025;
const ZOOM_MIN = 0.05;
const MAX_SCALE = 0.5;
const MIN_SCALE = 50;

const TimelineContainerStyle = css`
  background-color: var(--surface-color);
  width: 100%;
  height: 100%;
  transition: opacity var(--duration-normal);
  display: flex;
  align-items: stretch;
  position: relative;
`;

const TimelineStyle = css`
  overflow-x: scroll;
  // note: this is to prevent Chrome from going back to the previous page.
  overscroll-behavior-x: none;
  overflow-y: hidden;
  flex-grow: 1;
  position: relative;
  background-color: var(--background-color);
  --scrollbar-background: var(--background-color);
  height: 100%;
  width: 100%;
`;

const VisibleContainer = css`
  position: relative;
  overflow: hidden;
  height: 100%;
`;

const ScrollContainer = css`
  position: relative;
  overflow: visible;
  height: calc(100% - 19px);
`;

const PlayheadCursorStyle = css`
  position: absolute;
  width: 2px;
  top: 32px;
  bottom: 0;
  background-color: white;
  pointer-events: none;
  box-sizing: border-box;
  border: 1px solid #444;
  margin-left: -1.5px;
`;

const TrackContainerStyle = css`
  width: 100%;
  height: 100%;
  background-color: var(--surface-color);
`;

export interface TimelineProps extends PlaybackOption {}

export function Timeline({}: TimelineProps) {
  const containerRef = useRef<HTMLDivElement>();
  const playheadRef = useRef<HTMLDivElement>();
  const rangeRef = useRef<HTMLDivElement>();
  const rect = useSize(containerRef);

  const [{ scale, offset }, setOffsetScale] = useStorage(
    'timeline-scale-offset',
    {
      scale: 1,
      offset: 0.5 * rect.width,
    },
  );
  const {
    playback,
    start,
    end,
    rangeStart,
    rangeEnd,
    curr,
  } = usePlayback();

  const viewWidth = scale * rect.width;

  const isReady = playback.duration > 0;

  useEffect(() => {
    containerRef.current.scrollLeft = offset;
  }, [offset, rect.width > 0]);

  const currOffset = containerRef.current?.scrollLeft;
  return (
    <div css={TimelineContainerStyle} style={{ opacity: isReady ? 1 : 0 }}>
      <div
        ref={containerRef}
        css={TimelineStyle}
        onWheel={(event: WheelEvent<HTMLElement>) => {
          event.stopPropagation();
          const currOffset = containerRef.current?.scrollLeft;
          const isHorizontal = Math.abs(event.deltaX) > Math.abs(event.deltaY);
          if (isHorizontal)
            return setOffsetScale({
              offset: clamp(offset + event.deltaX, 0, viewWidth),
              scale,
            });

          if (!event.altKey)
            return setOffsetScale({
              offset: clamp(offset + event.deltaY, 0, viewWidth),
              scale,
            });

          const pos = event.clientX - 0.5 * rect.width + currOffset;
          playheadRef.current.style.left = `${pos}px`;

          const delta = Math.max(1, Math.abs(event.deltaY));
          const sign = Math.sign(event.deltaY);

          const ratio = 1 - sign * Math.max(ZOOM_MIN, delta * ZOOM_SPEED);
          let newScale = ratio * scale;
          newScale = Math.max(MAX_SCALE, newScale);
          newScale = Math.min(
            (MIN_SCALE *
              Math.max(playback.end - playback.start, 1)) /
              rect.width,
            newScale,
          );

          const left = currOffset + ((newScale - scale) / scale) * pos;

          setOffsetScale({
            scale: newScale,
            offset: clamp(left, 0, viewWidth),
          });
        }}
        onPointerDown={(event: PointerEvent<HTMLDivElement>) => {
          if (event.button !== MouseButton.Left) return;
          const currOffset = containerRef.current?.scrollLeft;
          // playheadRef.current.style.display = 'none';
          // if (event.button !== MouseButton.Left) return;
          let pos = event.clientX - 0.5 * rect.width + currOffset;
          pos = Math.max(0, pos);
          pos = Math.min(viewWidth, pos);

          playheadRef.current.style.left = `${pos}px`;
          // if (event.button !== MouseButton.Left) return;
          // playheadRef.current.style.display = 'none';
          const frame = Math.round(
            (pos / viewWidth) * (playback.end - playback.start) +
              playback.start,
          );
          playback.emitSeek(frame);
        }}
        onPointerUp={(event) => {
          if (event.button !== MouseButton.Left) return;
          containerRef.current.style.cursor = '';
          playheadRef.current.style.display = '';
        }}
        onPointerMove={(event: PointerEvent<HTMLDivElement>) => {
          // if (event.button !== MouseButton.Left) return;
          const currOffset = containerRef.current?.scrollLeft;
          let pos = event.clientX - 0.5 * rect.width + currOffset;
          try {
            playheadRef.current.style.left = `${pos}px`;
          } catch (e) {
            console.error(e);
          }

          pos = Math.max(0, pos);
          pos = Math.min(viewWidth, pos);

          // if (event.button !== MouseButton.Left) return;
          // playheadRef.current.style.display = 'none';
          const frame = Math.round(
            (pos / viewWidth) *
              Math.max(playback.end - playback.start, 1) +
              playback.start,
          );
          if (event.buttons & MouseMask.Primary) {
            playback.emitSeek(frame);
          }
        }}
      >
        <div
          css={VisibleContainer}
          style={{ width: `calc(100% + ${viewWidth}px)` }}
        >
          <div
            css={ScrollContainer}
            style={{
              width: `${viewWidth}px`,
              left: `calc((100% - ${viewWidth}px) * 0.5)`,
            }}
          >
            <Timestamps
              start={start}
              end={end}
              firstVisibleFrame={
                start -
                ((0.5 * rect.width - currOffset) / viewWidth) *
                  Math.max(end - start, 1)
              }
              lastVisibleFrame={
                start +
                ((rect.width - 0.5 * rect.width + currOffset) / viewWidth) *
                  Math.max(end - start, 1)
              }
              segmentDensity={Math.floor(
                (40 * Math.max(end - start, 1)) / viewWidth,
              )}
            />
            <div ref={playheadRef} css={PlayheadCursorStyle} />
            <Playhead
              seeking={curr}
              leftPos={((curr - start) / Math.max(end - start, 1)) * viewWidth}
            />
            <RangeSelector
              rangeRef={rangeRef}
              rangeStart={rangeStart}
              rangeEnd={rangeEnd}
              viewWidth={viewWidth}
            />
            <div css={TrackContainerStyle}>
              {/*<SceneTrack/>*/}
              {/*<LabelTrack/>*/}
              {/*<AudioTrack/>*/}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
