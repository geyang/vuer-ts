import styles from './Playback.module.scss';

// import { useApplication } from '../../contexts';
// import { usePlayerTime, useSubscribableValue } from '../../hooks';

// export function PlaybackProgress() {
//   const state = usePlayerTime();
//   return <Progress percentage={state.percentage}/>;
// }

// export function RenderingProgress() {
//   const { renderer } = useApplication();
//   const percentage = useSubscribableValue(
//     renderer.estimator.onCompletionChanged,
//   );
//   return <Progress percentage={percentage}/>;
// }

interface ProgressProps {
  /* The percentage of frames completed*/
  percentage: number;
}

function Progress({ percentage }: ProgressProps) {
  return (
    <div className={styles.progress}>
      <div
        className={styles.progressFill}
        style={{ width: `${percentage * 100}%` }}
      />
    </div>
  );
}
