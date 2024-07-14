import styles from './Controls.module.scss';
import { useEffect, useState } from "react";
import { MouseButton } from "../timeline/mouse_interfaces";
import { clamp } from "../../layout_components/utils";

export interface SliderProps {
  value?: number;
  onChange?: (value: number) => void;
}

export function Slider({ value, onChange }: SliderProps) {
  const [ internalValue, setInternalValue ] = useState(value);

  useEffect(() => {
    setInternalValue(value);
  }, [ value ]);

  return (
    <div
      className={styles.slider}
      onPointerDown={event => {
        if (event.button === MouseButton.Left) {
          event.preventDefault();
          event.stopPropagation();
          event.currentTarget.setPointerCapture(event.pointerId);

          const rect = event.currentTarget.getBoundingClientRect();
          const y = clamp(event.clientY - rect.y, 0, rect.height);
          const newInternalValue = 1 - y / rect.height;
          setInternalValue(clamp(newInternalValue, 0, 1));
        }
      }}
      onPointerMove={event => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.stopPropagation();

          const rect = event.currentTarget.getBoundingClientRect();
          const y = clamp(event.clientY - rect.y, 0, rect.height);
          const newInternalValue = 1 - y / rect.height;
          setInternalValue(clamp(newInternalValue, 0, 1));
        }
      }}
      onPointerUp={event => {
        if (event.button === MouseButton.Left) {
          event.stopPropagation();
          event.currentTarget.releasePointerCapture(event.pointerId);

          onChange?.(internalValue);
        }
      }}
    >
      <div className={styles.sliderTrack}>
        <div
          className={styles.sliderProgress}
          style={{ height: `${internalValue * 100}%` }}
        >
          <div className={styles.sliderThumb}/>
        </div>
      </div>
    </div>
  );
}
