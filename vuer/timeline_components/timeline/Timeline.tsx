import styles from './Timeline.module.scss';

// import { useSignal, useSignalEffect } from '@preact/signals';
// import { useLayoutEffect, useMemo, useRef } from 'preact/hooks';
// import { TimelineContextProvider, TimelineState, useApplication, } from '../../contexts';
// import {
//   useDocumentEvent,
//   useDuration,
//   usePreviewSettings,
//   useReducedMotion,
//   useSharedSettings,
//   useSize,
//   useStateChange,
//   useStorage,
// } from '../../hooks';
// import { useShortcut } from '../../hooks/useShortcut';
// import { labelClipDraggingLeftSignal } from '../../signals';
// import { clamp, MouseButton, MouseMask } from '../../utils';
// import { borderHighlight } from '../animations';
import { useLayoutEffect, useRef, UIEvent, WheelEvent, PointerEvent, useEffect } from "react";
import { css } from "@emotion/react";
import { SceneTrack } from "./SceneTrack";
import { Timestamps } from "./Timestamps";
import { RangeSelector } from "./RangeSelector";
import { RangeOption, stateSetter, usePlayback } from "../player";
import { Playhead } from "./Playhead";
import { useSize, useStorage } from "../hooks";
import { MouseButton, MouseMask } from "./mouse_interfaces";
import { clamp } from "../../layout_components/utils";

const ZOOM_SPEED = 0.000025;
const ZOOM_MIN = 0.05;
const MAX_SCALE = 0.5;
const MIN_SCALE = 50;

export function Timeline() {
  // const [ hoverRef ] = useShortcut<HTMLDivElement>('timeline');
  // const { player, meta } = useApplication();
  // const { range } = useSharedSettings();
  const containerRef = useRef<HTMLDivElement>();
  const playheadRef = useRef<HTMLDivElement>();
  const rangeRef = useRef<HTMLDivElement>();
  // const duration = useDuration();
  // const { fps } = usePreviewSettings();
  const rect = useSize(containerRef);
  const [ { scale, offset }, setOffsetScale ] = useStorage('timeline-scale-offset', {
    scale: 1, offset: 0.5 * rect.width
  });

  // console.log("scale", scale, "offset", offset)
  // const reduceMotion = useReducedMotion();
  // const seeking = useSignal<number | null>(null);
  // const warnedAboutRange = useRef(false);

  const viewWidth = scale * rect.width;

  // const sizes = useControls("playback", {
  //   playableLength: 800,
  // }, [])
  const player = usePlayback();

  const isReady = player.duration > 0;

  useLayoutEffect(() => {
    containerRef.current.scrollLeft = offset;
  }, [ offset, rect.width > 0 ]);

  // const sizes = useMemo(
  //   () => ({
  //     viewLength: rect.width,
  //     paddingLeft: rect.width / 2,
  //     fullLength: rect.width * scale + rect.width,
  //     playableLength: rect.width * scale,
  //   }),
  //   [ rect.width, scale ],
  // );

  // const zoomMax = (MAX_FRAME_SIZE / sizes.viewLength) * duration;

  // const conversion = useMemo(
  //   () => ({
  //     framesToPixels: (value: number) =>
  //       (value / duration) * sizes.playableLength,
  //     framesToPercents: (value: number) => (value / duration) * 100,
  //     pixelsToFrames: (value: number) =>
  //       (value / sizes.playableLength) * duration,
  //   }),
  //   [ duration, sizes ],
  // );

  // const state = useMemo<TimelineState>(() => {
  //   const density = Math.pow(
  //     2,
  //     Math.round(Math.log2(duration / sizes.playableLength)),
  //   );
  //   const segmentDensity = Math.floor(TIMESTAMP_SPACING * density);
  //   const clampedSegmentDensity = Math.max(1, segmentDensity);
  //   const relativeOffset = offset - sizes.paddingLeft;
  //   const firstVisibleFrame =
  //     Math.floor(
  //       conversion.pixelsToFrames(relativeOffset) / clampedSegmentDensity,
  //     ) * clampedSegmentDensity;
  //   const lastVisibleFrame =
  //     Math.ceil(
  //       conversion.pixelsToFrames(
  //         relativeOffset + sizes.viewLength + TIMESTAMP_SPACING,
  //       ) / clampedSegmentDensity,
  //     ) * clampedSegmentDensity;
  //   const startPosition = sizes.paddingLeft + rect.x - offset;
  //
  //   return {
  //     viewLength: sizes.viewLength,
  //     offset: relativeOffset,
  //     firstVisibleFrame,
  //     lastVisibleFrame,
  //     density,
  //     segmentDensity,
  //     pointerToFrames: (value: number) =>
  //       conversion.pixelsToFrames(value - startPosition),
  //     ...conversion,
  //   };
  // }, [ sizes, conversion, duration, offset ]);
  //
  // useStateChange(
  //   ([ prevDuration, prevWidth ]) => {
  //     const newDuration = duration / fps;
  //     let newScale = scale;
  //     if (prevDuration !== 0 && newDuration !== 0) {
  //       newScale *= newDuration / prevDuration;
  //     }
  //     if (prevWidth !== 0 && rect.width !== 0) {
  //       newScale *= prevWidth / rect.width;
  //     }
  //     if (!isNaN(newScale) && duration > 0) {
  //       setScale(clamp(ZOOM_MIN, zoomMax, newScale));
  //     }
  //   },
  //   [ duration / fps, rect.width ],
  // );
  //
  // useDocumentEvent('keydown', event => {
  //   if (document.activeElement.tagName === 'INPUT') {
  //     return;
  //   }
  //
  //   const frame = player.onFrameChanged.current;
  //   switch (event.key) {
  //   case 'f': {
  //     const maxOffset = sizes.fullLength - sizes.viewLength;
  //     const scrollLeft = state.framesToPixels(frame);
  //     const newOffset = clamp(0, maxOffset, scrollLeft);
  //     containerRef.current.scrollLeft = newOffset;
  //     setOffset(newOffset);
  //     break;
  //   }
  //   case 'b': {
  //     const end = player.status.secondsToFrames(range[1]);
  //     meta.shared.range.update(frame, end, duration, fps);
  //     break;
  //   }
  //   case 'n': {
  //     const start = player.status.secondsToFrames(range[0]);
  //     meta.shared.range.update(start, frame, duration, fps);
  //     break;
  //   }
  //   }
  // });
  //
  // useLayoutEffect(() => {
  //   containerRef.current.scrollLeft = offset;
  // }, [ scale ]);
  //
  // useSignalEffect(() => {
  //   const offset = labelClipDraggingLeftSignal.value;
  //   if (offset !== null && playheadRef.current) {
  //     playheadRef.current.style.left = `${
  //       state.framesToPixels(player.status.secondsToFrames(offset)) +
  //       sizes.paddingLeft
  //     }px`;
  //   }
  // });
  //
  // const scrub = (x: number) => {
  //   const frame = Math.floor(state.pointerToFrames(x));
  //
  //   seeking.value = player.clampRange(frame);
  //   if (player.onFrameChanged.current !== frame) {
  //     player.requestSeek(frame);
  //   }
  //
  //   const isInUserRange = player.isInUserRange(frame);
  //   const isOutOfRange = player.isInRange(frame) && !isInUserRange;
  //   if (!warnedAboutRange.current && !reduceMotion && isOutOfRange) {
  //     warnedAboutRange.current = true;
  //     rangeRef.current?.animate(borderHighlight(), {
  //       duration: 200,
  //     });
  //   }
  //
  //   if (isInUserRange) {
  //     warnedAboutRange.current = false;
  //   }
  // };

  const scrub = (x: number) => {
    const frame = Math.round(x / viewWidth * (player.duration - 1));

    console.log(x);

    // publishes to the subscribers.
    player.emitSeek(frame)

    // seeking.value = player.clampRange(frame);
    // if (player.onFrameChanged.current !== frame) {
    //   player.requestSeek(frame);
    // }

    // const isInUserRange = player.isInUserRange(frame);
    // const isOutOfRange = player.isInRange(frame) && !isInUserRange;
    // if (!warnedAboutRange.current && !reduceMotion && isOutOfRange) {
    //   warnedAboutRange.current = true;
    //   rangeRef.current?.animate(borderHighlight(), {
    //     duration: 200,
    //   });
    // }
    //
    // if (isInUserRange) {
    //   warnedAboutRange.current = false;
    // }
  };

  // console.log(player.range.start, player.range.end)

  const currOffset = containerRef.current?.scrollLeft;
  return (
    <div
      css={css`
          background-color: var(--surface-color);
          width: 100%;
          height: 100%;
          opacity: ${isReady ? 1 : 0};
          transition: opacity var(--duration-normal);
          display: flex;
          align-items: stretch;
          position: relative;
      `}
    >
      <div
        ref={containerRef}
        css={css`
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
        `}
        // onScroll={(event: UIEvent<HTMLElement>) => {
        //   setOffsetScale({ offset, scale });
        // }}
        onWheel={(event: WheelEvent<HTMLElement>) => {
          event.stopPropagation()
          const currOffset = containerRef.current?.scrollLeft;
          const isHorizontal = Math.abs(event.deltaX) > Math.abs(event.deltaY);
          if (isHorizontal) return setOffsetScale({
            offset: clamp(offset + event.deltaX, 0, viewWidth),
            scale
          })

          if (!event.altKey) return setOffsetScale({
            offset: clamp(offset + event.deltaY, 0, viewWidth),
            scale
          })

          const pos = event.clientX - 0.5 * rect.width + currOffset;
          playheadRef.current.style.left = `${pos}px`;

          const delta = Math.max(1, Math.abs(event.deltaY));
          const sign = Math.sign(event.deltaY);

          const ratio = 1 - sign * Math.max(ZOOM_MIN, delta * ZOOM_SPEED);
          let newScale = ratio * scale;
          newScale = Math.max(MAX_SCALE, newScale);
          newScale = Math.min(MIN_SCALE * Math.max(player.end - player.start, 1) / rect.width, newScale)

          const left = currOffset + (newScale - scale) / scale * pos;

          setOffsetScale({ scale: newScale, offset: clamp(left, 0, viewWidth) });
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
          const frame = Math.round(pos / viewWidth * (player.end - player.start) + player.start);
          player.emitSeek(frame);
        }}
        onPointerUp={event => {
          if (event.button !== MouseButton.Left) return;
          containerRef.current.style.cursor = '';
          playheadRef.current.style.display = '';
        }}
        onPointerMove={(event: PointerEvent<HTMLDivElement>) => {
          // if (event.button !== MouseButton.Left) return;
          const currOffset = containerRef.current?.scrollLeft;
          let pos = event.clientX - 0.5 * rect.width + currOffset;
          playheadRef.current.style.left = `${pos}px`;

          pos = Math.max(0, pos);
          pos = Math.min(viewWidth, pos);

          // if (event.button !== MouseButton.Left) return;
          // playheadRef.current.style.display = 'none';
          const frame = Math.round(pos / viewWidth * (player.end - player.start) + player.start);
          if (event.buttons & MouseMask.Primary) {
            player.emitSeek(frame);
          }
        }}
      >
        <div
          css={css`
              position: relative;
              overflow: hidden;
              height: 100%;
              width: calc(100% + ${viewWidth}px);
          `}
        >
          <div
            css={css`
                position: relative;
                overflow: visible;
                height: calc(100% - 19px);
                width: ${viewWidth}px;
                left: calc((100% - ${viewWidth}px) * 0.5);
            `}
          >
            <RangeSelector
              rangeRef={rangeRef}
              fps={player.fps}
              duration={player.duration}
              start={player.start}
              end={player.end}
              rangeStart={player.range.start}
              rangeEnd={player.range.end}
              viewWidth={viewWidth}
              selectRange={player.setRange as stateSetter<RangeOption>}
            />
            <Timestamps
              start={player.start}
              end={player.end}
              firstVisibleFrame={player.start - (0.5 * rect.width - currOffset) / viewWidth * (player.duration - 1)}
              lastVisibleFrame={player.start + (rect.width - 0.5 * rect.width + currOffset) / viewWidth * (player.duration - 1)}
              segmentDensity={Math.floor(40 * (player.duration - 1) / viewWidth)}
            />
            <div
              css={css`
                  width: 100%;
                  height: 100%;
                  background-color: var(--surface-color);
              `}
            >
              <SceneTrack/>
              {/*<LabelTrack/>*/}
              {/*<AudioTrack/>*/}
            </div>
            <div
              ref={playheadRef}
              css={css`
                  position: absolute;
                  width: 2px;
                  top: 32px;
                  bottom: 0;
                  background-color: white;
                  pointer-events: none;
                  box-sizing: border-box;
                  border: 1px solid #444;
                  margin-left: -1.5px;
              `}/>
            <Playhead
              seeking={player.curr}
              leftPos={(player.curr - player.start) / (player.end - player.start) * viewWidth}/>
          </div>
        </div>
      </div>
    </div>
  );
}
