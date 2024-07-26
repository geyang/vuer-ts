import { css } from '@emotion/react';

import { IconButton, IconCheckbox, Input, Select } from '../controls';
import {
  FastForward,
  FastRewind,
  Pause,
  PhotoCamera,
  PlayArrow,
  Recording,
  Repeat,
  SkipNext,
  SkipPrevious,
} from '../icons';
import { Trash } from '../icons/Trash';
import { useMemo } from 'react';
import { usePlayback, usePlaybackStates } from '../playbackHooks';

const style = css`
  display: flex;
  justify-content: center;
  gap: 16px;
`;

export function PlaybackControls() {
  const playback = usePlayback();
  const { maxlen, speed, paused, loop, fps, recording } = usePlaybackStates();

  const options = useMemo(() => {
    return [
      { value: 0.125, text: '12.5%' },
      { value: 0.25, text: '25%' },
      { value: 0.5, text: '50%' },
      { value: 1, text: '✕1' },
      { value: 1.5, text: '✕1.5' },
      { value: 2, text: '✕2' },
      { value: 4, text: '✕4' },
    ];
  }, []);

  return (
    <div css={style}>
      <Select<number>
        title='Playback speed'
        width={60}
        options={options}
        value={speed}
        onChange={(s) => playback.setSpeed(s)}
      />
      <IconButton
        title='Start [Shift + Left arrow]'
        onClick={() => playback.reset()}
      >
        <SkipPrevious />
      </IconButton>
      <IconButton
        title='Previous frame [Left arrow]'
        onClick={() => playback.seekPrevious()}
      >
        <FastRewind />
      </IconButton>
      <IconButton
        title={paused ? 'Pause [Space]' : 'Play [Space]'}
        onClick={() => playback.togglePlayback()}
      >
        {paused ? <PlayArrow /> : <Pause />}
      </IconButton>
      <IconButton
        title='Next frame [Right arrow]'
        onClick={() => playback.seekNext()}
      >
        <FastForward />
      </IconButton>
      <IconButton
        title='End [Shift + Right arrow]'
        onClick={() => playback.seekEnd()}
      >
        <SkipNext />
      </IconButton>
      <IconCheckbox
        title='Disable looping [L]'
        titleOff='Enable looping [L]'
        active={loop}
        onChange={() => playback.toggleLoop()}
      >
        <Repeat />
      </IconCheckbox>
      <Input
        title='Current framerate'
        value={playback.fps}
        postfix='FPS'
        onChange={(v) => playback.setFrameRate(v)}
        type='number'
        width={playback.fps >= 100 ? '33px' : '25px'}
      />
      <IconButton title='Save snapshot'>
        <PhotoCamera />
      </IconButton>
      <Input
        title='Current framerate'
        value={maxlen}
        prefix='Maxlen '
        onChange={(v) => playback.setMaxlen(v)}
        type='number'
        width='50px'
      />
      <IconButton
        title={recording ? 'Stop Recording' : 'Record'}
        onClick={() => playback.toggleRecording()}
      >
        <Recording active={recording} />
      </IconButton>
      <IconButton
        title='clear the key frames buffer'
        onClick={() => playback.clear()}
      >
        <Trash />
      </IconButton>
    </div>
  );
}
