import { css } from '@emotion/react';
import { HTMLAttributes } from 'react';
import { Signal } from '@preact/signals-react';

const buttonStyle = css`
  display: block;
  cursor: pointer;
  margin: 0;
  color: rgba(255, 255, 255, 0.54);

  &:hover {
    color: #fff !important;
    accent-color: #fff !important;
  }

  &:active {
    color: #23aaff !important;
    accent-color: #23aaff !important;
  }
`;
const disabledStyle = css`
  cursor: default;
  pointer-events: none;
  color: rgba(255, 255, 255, 0.16);
`;

interface IconButtonProps
  extends Omit<
    HTMLAttributes<HTMLButtonElement>,
    'title' | 'onChange' | 'disabled'
  > {
  title?: string;
  onClick?: () => void;
  disabled?: boolean | Signal<boolean>;
}

export function IconButton({
  children,
  onClick,
  title,
  disabled,
}: IconButtonProps) {
  return (
    <button
      disabled={disabled as unknown as boolean}
      title={title as unknown as string}
      css={[
        buttonStyle,
        disabled && disabledStyle,
      ]}
      type="button"
      onClick={disabled ? null : onClick}
    >
      {children}
    </button>
  );
}
