import styles from './Timeline.module.scss';

import { KeyFrame, KeyFrameTrack } from './KeyFrameTrack';
import { useScenes } from "../hooks";
import { useState } from "react";

export function SceneTrack() {
  const scenes = useScenes();

  return (
    <div className={styles.sceneTrack}>
      {scenes.map(scene => (
        <SceneClip {...scene}/>
      ))}
    </div>
  );
}

interface SceneClipProps {
  firstFrame: number;
  lastFrame: number;
  keyFrames: KeyFrame[];
  transitionDuration: number;
  duration: number;
  nameStyle: Record<string, unknown>;
  width?: number;
  name: string;
}

function SceneClip({
  name,
  firstFrame,
  lastFrame,
  keyFrames,
  transitionDuration,
  duration,
  nameStyle,
  width = 80,
}: SceneClipProps) {
  // const { player, meta } = useApplication();
  // const { framesToPercents, framesToPixels, offset } = useTimelineContext();
  // const cachedData = useSubscribableValue(scene.onCacheChanged);

  // const nameStyle = useMemo(() => {
  //   const sceneOffset = framesToPixels(firstFrame);
  //   return offset > sceneOffset
  //     ? { paddingLeft: `${offset - sceneOffset}px` }
  //     : {};
  // }, [ offset, firstFrame, framesToPixels ]);

  const [ range, setRange ] = useState([ 0, 0 ]);

  return (
    <div
      className={styles.clip}
      style={{
        width: `${width}%`,
      }}
      onMouseDown={event => {
        if (event.button === 1) {
          event.preventDefault();
        }
      }}
      onMouseUp={event => {
        if (event.button === 1) {
          event.stopPropagation();
          setRange([ firstFrame, lastFrame ]);
        }
      }}
    >
      {transitionDuration > 0 && (
        <div
          style={{
            width: `${
              (transitionDuration / duration) * 100
            }%`,
          }}
          className={styles.transition}
        />
      )}
      <div className={styles.container}>
        <div
          className={styles.name}
          style={nameStyle}
          title="Go to source"
          onPointerDown={event => {
            event.stopPropagation();
          }}
          onPointerUp={async event => {
            event.stopPropagation();
            console.log('going to source.')
            // if (scene.creationStack) {
            //   await findAndOpenFirstUserFile(scene.creationStack);
            // }
          }}
        >
          {name}
        </div>
      </div>
      <KeyFrameTrack
        keyFrames={keyFrames}
        duration={duration} // in seconds
      />
    </div>
  );
}
