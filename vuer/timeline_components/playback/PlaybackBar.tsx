import { css } from "@emotion/react";
import { PlaybackControls } from "./PlaybackControls";
import { Timestamp } from "./CurrentTime";


export const PlaybackBar = () => {
  return (
    <div css={css`
        background: var(--surface-color);
        display: grid;
        grid-template-columns: 1fr min-content 1fr;
        padding: 12px;
        user-select: none;
    `}>
      <Timestamp
        // className={styles.time}
        title="Current time"
        // frameTitle="Current frame"
        frame={0}
      />
      <PlaybackControls/>
      <Timestamp
        // className={styles.time}
        title="Duration"
        // frameTitle="Current frame"
        frame={0}
        right
      />
    </div>
  );
}
