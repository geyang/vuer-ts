import styles from './Controls.module.scss';
import { InputHTMLAttributes } from "react";

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value'> {
  value: unknown;
}

export function Input({ value, onChange, onChangeCapture, ...props }: InputProps) {
  return (
    <input
      readOnly={onChangeCapture !== undefined}
      value={String(value)}
      onChangeCapture={onChangeCapture ?? onChange}
      onChange={onChangeCapture ? onChange : undefined}
      className={styles.input}
      {...props}
    />
  );
}
