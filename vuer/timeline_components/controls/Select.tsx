import { useCallback } from 'react';
import { Signal } from '@preact/signals-react';
import { css } from '@emotion/react';

const style = css`
  //flex-basis: 100%;
  cursor: pointer;

  font-family: var(--font-family-mono);

  background-color: var(--input-background);
  color: rgba(255, 255, 255, 0.6);
  border: 0;
  border-radius: var(--radius);
  padding: 0 8px;
  height: 24px;
  flex-shrink: 1;
  flex-grow: 1;
  min-width: 0;

  :hover {
    background-color: var(--input-background-hover);
  }

  :disabled {
    pointer-events: none;
    opacity: 0.54;
  }
`;

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

  const valueIsSignal = value instanceof Signal;
  const v = valueIsSignal ? (value as Signal<T>).value : value;

  return (
    <select
      title={title}
      disabled={disabled}
      css={style}
      style={{ width: typeof width === 'number' ? `${width}px` : width }}
      value={options.findIndex((option) => option.value === v)}
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
