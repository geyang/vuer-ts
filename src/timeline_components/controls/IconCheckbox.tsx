import { HTMLAttributes } from 'react';
import { buttonStyle, disabledStyle } from './IconCheckbox.module.scss';

interface IconCheckboxProps
  extends Omit<
    HTMLAttributes<HTMLButtonElement>,
    'children' | 'onChange' | 'disabled'
  > {
  title?: string;
  titleOff?: string;
  onChange?: () => void;
  active?: boolean;
  disabled?: boolean;
  children: JSX.Element | JSX.Element[];
}

export function IconCheckbox({
  children,
  title,
  titleOff,
  onChange,
  active,
  disabled,
}: IconCheckboxProps) {
  // if children is not an array, do the following
  if (!Array.isArray(children)) children = [ children ] as JSX.Element[];

  const [ onChild, offChild, ..._ ] = [ ...(children as JSX.Element[]), null ];

  return (
    <button
      title={active ? title : titleOff}
      onClick={onChange}
      className={`${buttonStyle} ${disabled && disabledStyle}`}
      style={{
        color: active && `var(--theme) !important`,
      }}
    >
      {active ? onChild : offChild || onChild}
    </button>
  );
}
