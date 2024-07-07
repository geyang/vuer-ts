import styles from './Controls.module.scss';

import clsx from 'clsx';
import { HTMLAttributes } from "react";

interface IconButtonProps extends Omit<HTMLAttributes<HTMLButtonElement>, 'onChange'> {
  title?: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export function IconButton({
  children,
  onClick,
  title,
  className,
  disabled,
}: IconButtonProps) {
  return (
    <button
      disabled={disabled}
      title={title}
      className={clsx(
        styles.iconButton,
        className,
        disabled && styles.disabled,
      )}
      type="button"
      onClick={disabled ? null : onClick}
    >
      {children}
    </button>
  );
}
