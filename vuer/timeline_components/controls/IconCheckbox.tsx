import { css } from '@emotion/react';
import { HTMLAttributes } from 'react';

const buttonStyle = css`
  display: block;
  cursor: pointer;
  margin: 0;
  color: rgba(255, 255, 255, 0.54);

  :hover {
    color: #fff;
  }

  :active {
    color: var(--theme);
  }
`;

const disabledStyle = css`
  cursor: default;
  pointer-events: none;
  color: rgba(255, 255, 255, 0.16);
`;

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
  if (!Array.isArray(children)) children = [children] as JSX.Element[];

  const [onChild, offChild, ..._] = [...(children as JSX.Element[]), null];

  return (
    <button
      title={active ? title : titleOff}
      onClick={onChange}
      css={[buttonStyle, disabled && disabledStyle]}
      style={{
        color: active && `var(--theme) !important`,
      }}
    >
      {active ? onChild : offChild || onChild}
    </button>
  );
}
