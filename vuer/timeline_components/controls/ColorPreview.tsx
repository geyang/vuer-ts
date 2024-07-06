import styles from './Controls.module.scss';
import { HTMLAttributes } from "react";

interface ColorPreviewProps extends HTMLAttributes<HTMLDivElement> {
  color: string;
}

export function ColorPreview({ color, ...props }: ColorPreviewProps) {
  return (
    <div className={styles.colorPreview} {...props}>
      <div style={{ background: color }}/>
    </div>
  );
}
