import { css } from '@emotion/react';

const style = css`
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 99999;

  button:first-of-type {
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
    border-left: 1px solid white;
    border-top: 1px solid white;
    border-bottom: 1px solid white;
  }

  button:last-of-type {
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
    border-right: 1px solid white;
    border-top: 1px solid white;
    border-bottom: 1px solid white;
  }

  button:not(:first-of-type) {
    //padding-left: 12px;
  }

  button:not(:last-of-type) {
    //padding-right: 12px;
    border-right: 1px solid white;
  }
`;

const buttonStyle = css`
  cursor: pointer;
  border-radius: 0;
  background: rgba(0, 0, 0, 0.1);
  color: white;
  font: normal 0.8125rem sans-serif;
  padding: 12px 24px;
  outline: none;

  :hover {
    background: rgba(255, 255, 255, 0.1);
  }

  :active {
    background: rgba(0, 0, 0, 0.2);
  }
`

export const XRButton = () => {
  return (
    <div css={style}>
      <button css={buttonStyle}>Virtual Reality</button>
      <button css={buttonStyle}>Pass-through</button>
    </div>
  );
};
