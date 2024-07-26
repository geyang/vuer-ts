import { css } from '@emotion/react';
import {
  InputHTMLAttributes,
  useCallback,
  useLayoutEffect,
  useRef,
} from 'react';

const ContainerStyle = css`
  font-family: var(--font-family-mono);

  background-color: var(--input-background);
  color: rgba(255, 255, 255, 0.6);
  border-radius: var(--radius);
  border: 0;
  padding: 0 8px;
  height: 24px;
  flex-shrink: 1;
  flex-grow: 1;
  min-width: 0;
  display: inline-block;

  text-wrap: nowrap;

  :before {
    content: attr(data-prefix);
    z-index: 1;
    color: rgba(255, 255, 255, 0.6);
    display: inline;
  }

  :after {
    content: attr(data-postfix);
    z-index: 1;
    color: rgba(255, 255, 255, 0.6);
    display: inline;
  }

  :hover {
    background-color: var(--input-background-hover);
  }

  &.main {
    --loading-stripe-color: var(--theme-light);
    background-color: var(--theme);
    color: rgba(0, 0, 0, 0.87);
    font-weight: bold;

    &:hover {
      box-shadow: 0 0 0 2px white inset;
    }
  }

  &:disabled {
    pointer-events: none;
    opacity: 0.54;
  }
`;
const InputStyle = css`
  display: inline;
  border: 0;
  margin: 0;
  padding: 0;
  height: 24px;
  background-color: transparent;
  color: rgba(255, 255, 255, 0.6);

  padding-block: 0;
  padding-inline: 0;

  :focus {
    outline: none;
  }

  ::-webkit-inner-spin-button,
  ::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
    width: 0;
    height: 0;
  }

  //for firefox.
  -moz-appearance: textfield;
`;

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
    <div css={ContainerStyle} data-postfix={postfix} data-prefix={prefix}>
      <input
        ref={inputRef}
        css={InputStyle}
        style={{ width: `${width}` }}
        value={value as unknown as number}
        onChange={cb}
        onSubmit={cb}
        {...props}
      />
    </div>
  );
}
