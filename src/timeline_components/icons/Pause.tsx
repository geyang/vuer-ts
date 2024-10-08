import { svg } from './icon.module.scss';

export function Pause() {
  return (
    <svg
      viewBox="0 0 320 512"
      fill="currentColor"
      className={svg}
    >
      <path
        d="M48 64C21.5 64 0 85.5 0 112V400c0 26.5 21.5 48 48 48H80c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H48zm192 0c-26.5 0-48 21.5-48 48V400c0 26.5 21.5 48 48 48h32c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H240z"/>
    </svg>
  );
}
