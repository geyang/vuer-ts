import { css } from '@emotion/react';
import { HTMLAttributes } from "react";

interface IconCheckboxProps extends Omit<HTMLAttributes<HTMLButtonElement>, 'onChange'> {
  titleOn?: string;
  titleOff?: string;
  onChange?: () => void;
  checked?: boolean;
  disabled?: boolean;

}

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


export function IconCheckbox({
  children,
  titleOn,
  titleOff,
  onChange,
  checked,
  disabled,
}: IconCheckboxProps) {
  return (
    <button
      title={checked ? titleOn : titleOff}
      onClick={onChange}
      css={[
        buttonStyle,
        disabled && disabledStyle,
      ]}
      style={{ color: checked && `var(--theme) !important` }}
    >
      {children}
    </button>
  );
}
