import styles from './Controls.module.scss';

import clsx from 'clsx';
import { IconButton } from './IconButton';
import { HTMLAttributes } from "react";

interface IconCheckboxProps extends Omit<HTMLAttributes<HTMLButtonElement>, 'onChange'> {
  titleOn?: string;
  titleOff?: string;
  onChange?: (value: boolean) => void;
  checked?: boolean;
  main?: boolean;
}

export function IconCheckbox({
  children,
  titleOn,
  titleOff,
  onChange,
  checked = false,
  main = false,
}: IconCheckboxProps) {
  return (
    <IconButton
      className={clsx(
        styles.iconCheckbox,
        main && styles.main,
        checked && styles.checked,
      )}
      title={titleOff && !checked ? titleOff : titleOn}
      onClick={() => onChange?.(!checked)}
    >
      {children}
    </IconButton>
  );
}
