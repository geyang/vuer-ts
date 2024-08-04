import { style, buttonStyle } from './xrButton.module.scss';

export const XRButton = () => {
  return (
    <div className={style}>
      <button className={buttonStyle}>Virtual Reality</button>
      <button className={buttonStyle}>Pass-through</button>
    </div>
  );
};
