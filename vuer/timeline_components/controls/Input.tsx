import { HTMLAttributes } from "react";
import styles from './Controls.module.scss';

type InputProps = {
  value: unknown;
} & HTMLAttributes<HTMLInputElement>;

export function Input({ value, onChange, onChangeCapture, ...props }: InputProps) {
  return (
    <input
      value={String(value)}
      onChangeCapture={onChangeCapture ?? onChange}
      onChange={onChangeCapture ? onChange : undefined}
      className={styles.input}
      {...props}
    />
  );
}
