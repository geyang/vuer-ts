import {
  InputHTMLAttributes,
  useCallback,
  useLayoutEffect,
  useRef,
} from 'react';
import { containerStyle, inputStyle } from './Input.module.scss';

interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: number;
  postfix?: string;
  width?: number | string;
  onChange: (fps: number) => void;
}

export function Input({
  value,
  onChange,
  width,
  prefix,
  postfix,
  ...props
}: InputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useLayoutEffect(() => {
    if (!inputRef.current) return;
    inputRef.current.size = Math.max(inputRef.current.value.length, 1);
  }, [value]);

  const cb = useCallback((e) => {
    const value = e.target.value;
    const num = parseFloat(value);
    if (Number.isNaN(num)) return;
    onChange(num);
  }, []);

  return (
    <div className={containerStyle} data-postfix={postfix} data-prefix={prefix}>
      <input
        ref={inputRef}
        className={inputStyle}
        style={{ width: `${width}` }}
        value={value as unknown as number}
        onChange={cb}
        onSubmit={cb}
        {...props}
      />
    </div>
  );
}
