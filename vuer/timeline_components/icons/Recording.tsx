import { FC } from 'react';
import styles from './Recording.module.scss';

interface RecordingProps {
  active: boolean;
}

export const Recording: FC<RecordingProps> = ({ active }) => {
  const style = active ? styles.activeStyle : styles.disabledStyle;
  return (
    <svg width='24' height='24' viewBox='0 0 100 100'>
      <circle className={style} cx='50' cy='50' r='30' />
    </svg>
  );
};
