import clsx from 'clsx';
import styles from './Controls.module.scss';
import { HTMLAttributes } from "react";

export interface ButtonProps
  extends HTMLAttributes<HTMLButtonElement> {
  main?: boolean;
  loading?: boolean;
  disabled?: boolean;
}

export function Button({ main, loading, className, ...props }: ButtonProps) {
  return (
    <button
      type='button'
      className={clsx(
        styles.button,
        className,
        main && styles.main,
        loading && 'loading',
      )}
      onMouseUp={event => (event.target as HTMLButtonElement).blur()}
      {...props}
    />
  );
}
