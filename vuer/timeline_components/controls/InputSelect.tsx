import {HTMLInputTypeAttribute } from "react";
import { Input } from './Input';
import { Select, SelectProps } from './Select';
import styles from './Controls.module.scss';

export type InputSelectProps<T> = {
  options: SelectProps<T>['options'];
  value: T;
  onChange: (value: T) => void;
} & SelectProps<T>;

export function InputSelect<T extends string | number>({
  options,
  value,
  onChange,
  ...props
}: InputSelectProps<T>) {
  return (
    <div className={styles.inputSelect}>
      <Input
        value={value}
        onChange={event => {
          onChange((event.target as HTMLInputElement).value as T);
        }}
        {...props}
      />
      <Select value={value} options={options} onChange={onChange}/>
    </div>
  );
}
