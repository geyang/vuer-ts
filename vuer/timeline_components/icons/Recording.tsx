import { css, keyframes } from '@emotion/react';

const breathAnimation = keyframes`
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.2;
  }
  100% {
    opacity: 1;
  }
`;

const activeStyle = css`
  fill: red;
  stroke: transparent;
  stroke-width: 0;
  animation: ${breathAnimation} 5s infinite;

  :hover {
    animation: none;
    fill: transparent;
    stroke: white;
    stroke-width: 10;
  }
`;

const disabledStyle = css`
  fill: transparent;
  stroke: rgba(255, 255, 255, 0.54);
  stroke-width: 10;

  :hover {
    fill: red;
    stroke: white;
    opacity: 1 !important;
  }
`;

interface RecordingProps {
  active: boolean;
}

export const Recording = ({ active }: RecordingProps) => {
  const style = active ? activeStyle : disabledStyle;
  return (
    <svg width='100' height='100' viewBox='0 0 100 100'>
      <circle css={style} cx='50' cy='50' r='30' />
    </svg>
  );
};
