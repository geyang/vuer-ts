import clsx from 'clsx';
import { ChevronRight } from '../icons/ChevronRight';
import styles from './Controls.module.scss';
import { HTMLAttributes } from "react";

export interface ToggleProps
  extends Omit<HTMLAttributes<HTMLButtonElement>, 'onToggle'> {
  open?: boolean;
  onToggle?: (value: boolean) => void;
  animated?: boolean;
}

export function Toggle({
  open,
  onToggle,
  animated = true,
  ...props
}: ToggleProps) {
  return (
    <button
      type='button'
      className={clsx(
        styles.toggle,
        open && styles.open,
        animated && styles.animated,
      )}
      onClick={() => onToggle?.(!open)}
      {...props}
    >
      <ChevronRight/>
    </button>
  );
}
