import clsx from 'clsx';
import styles from './Timeline.module.scss';

export interface KeyFrame {
  name: string;
  time: number;
}

export interface KeyFrameTrack {
  duration: number;
  keyFrames: KeyFrame[];
}


export function KeyFrameTrack({ keyFrames, duration }: KeyFrameTrack) {

  return keyFrames.length > 0 ? (
    <div className={styles.slideTrack}>
      {keyFrames[0].time > 0 && (
        <div
          className={clsx(styles.clip, styles.continuation)}
          style={{ left: 0, width: `${(keyFrames[0].time / duration) * 100}%` }}
        />
      )}
      {keyFrames.map((frame, index) => (
        <div
          className={styles.clip}
          style={{
            width: `${
              (((keyFrames[index + 1]?.time ?? duration) - frame.time) /
                duration) *
              100
            }%`,
          }}
        >
        </div>
      ))}
    </div>
  ) : (
    <></>
  );
}
