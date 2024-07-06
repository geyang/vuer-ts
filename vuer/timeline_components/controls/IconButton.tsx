import styles from './Controls.module.scss';

import clsx from 'clsx';
import { ReactElement } from "react";

interface IconButtonProps {
  title?: string;
  onClick?: () => void;
  children: ReactElement[];
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
