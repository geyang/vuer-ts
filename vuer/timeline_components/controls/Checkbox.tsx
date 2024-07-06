import { HTMLAttributes } from "react";
import styles from './Controls.module.scss';

type InputProps = HTMLAttributes<HTMLInputElement>;

export function Checkbox(props: InputProps) {
  return <input type="checkbox" className={styles.checkbox} {...props} />;
}
