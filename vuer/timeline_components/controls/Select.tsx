import { useCallback } from 'react';
import { style } from "./Select.module.scss";


export interface SelectProps<T> {
  title?: string;
  options: { value: T; text: string }[];
  width?: string | number;
  disabled?: boolean;
  value: T;
  onChange?: (value: T) => void;
}

export function Select<T>({
  title,
  options,
  width,
  value,
  onChange = null,
  disabled,
}: SelectProps<T>) {
  const _onChange = useCallback(
    (event) => {
      if (!onChange) return;
      onChange(
        options[parseInt((event.target as HTMLSelectElement).value)].value,
      );
      (event.target as HTMLSelectElement).blur();
    },
    [onChange],
  );

  return (
    <select
      title={title}
      disabled={disabled}
      className={style}
      style={{ width: typeof width === 'number' ? `${width}px` : width }}
      value={options.findIndex((option) => option.value === value)}
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
