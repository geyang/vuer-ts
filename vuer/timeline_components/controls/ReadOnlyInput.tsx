import clsx from 'clsx';

import styles from './Controls.module.scss';
import { HTMLAttributes } from "react";

interface ReadOnlyInputProps extends HTMLAttributes<HTMLDivElement> {
}

export function ReadOnlyInput({ className, ...props }: ReadOnlyInputProps) {
  return <div className={clsx(className, styles.input)} {...props} />;
}
