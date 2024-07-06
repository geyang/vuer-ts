import { HTMLAttributes } from "react";
import styles from './Controls.module.scss';

type LabelProps = HTMLAttributes<HTMLLabelElement>;

export function Label(props: LabelProps) {
  return (
    <label
      title={props.children as string}
      className={styles.label}
      {...props}
    />
  );
}
