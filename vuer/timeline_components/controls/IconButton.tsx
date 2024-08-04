import { HTMLAttributes } from 'react';
import { buttonStyle, disabledStyle } from './IconButton.module.scss';

interface IconButtonProps
  extends Omit<
    HTMLAttributes<HTMLButtonElement>,
    'title' | 'onChange' | 'disabled'
  > {
  title?: string;
  onClick?: () => void;
  disabled?: boolean;
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
      className={`${buttonStyle} ${disabled && disabledStyle}`}
      type='button'
      onClick={disabled ? null : onClick}
    >
      {children}
    </button>
  );
}
