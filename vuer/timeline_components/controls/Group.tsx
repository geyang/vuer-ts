import { HTMLAttributes } from "react";
import styles from './Controls.module.scss';

export function Group(props: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={styles.group} {...props}>
      {props.children}
    </div>
  );
}
