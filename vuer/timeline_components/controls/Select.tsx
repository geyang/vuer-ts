import clsx from 'clsx';
import styles from './Controls.module.scss';
import { useCallback } from "react";

export interface SelectProps<T> {
  title?: string;
  options: { value: T; text: string }[];
  className?: string;
  main?: boolean;
  disabled?: boolean;
  value: T;
  onChange?: (value: T) => void;
}

export function Select<T>({
  options,
  value,
  onChange = null,
  title,
  main,
  disabled,
  className,
}: SelectProps<T>) {
  const _onChange = useCallback(
    event => {
      if (!onChange) return;
      onChange(
        options[parseInt((event.target as HTMLSelectElement).value)].value,
      );
      (event.target as HTMLSelectElement).blur();
    }, [ onChange ])
  return (
    <select
      title={title}
      disabled={disabled}
      className={clsx(styles.select, className, main && styles.main)}
      value={options.findIndex(option => option.value === value)}
      onChange={_onChange}
    >
      {options.map((option, index) => (
        <option key={String(option.value)} value={index}>
          {option.text}
        </option>
      ))}
    </select>
  );
}
