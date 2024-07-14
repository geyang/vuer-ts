import { css } from "@emotion/react";
import { CSSProperties, HTMLAttributes } from "react";

interface IconButtonProps extends Omit<HTMLAttributes<HTMLButtonElement>, 'onChange'> {
  title?: string;
  onClick?: () => void;
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

`;
const disabledStyle = css`
    cursor: default;
    pointer-events: none;
    color: rgba(255, 255, 255, 0.16);
`;

export function IconButton({
  children,
  onClick,
  title,
  disabled,
}: IconButtonProps) {
  return (
    <button
      disabled={disabled}
      title={title}
      css={[
        buttonStyle,
        disabled && disabledStyle,
      ]}
      type="button"
      onClick={disabled ? null : onClick}
    >
      {children}
    </button>
  );
}
