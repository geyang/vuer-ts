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
import { usePlayback } from '../playback';
import { Trash } from '../icons/Trash';
import { useMemo } from 'react';

export function PlaybackControls() {
  const { playback, maxlen, speed, paused, loop, fps, recording } =
    usePlayback();

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
    <div
      css={css`
        display: flex;
        justify-content: center;
        gap: 16px;
      `}
    >
      <Select<number>
        title='Playback speed'
        options={options}
        value={speed}
        onChange={playback.setSpeed}
      />
      <IconButton title='Start [Shift + Left arrow]' onClick={playback.reset}>
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
        onClick={playback.togglePlayback}
      >
        {paused ? <PlayArrow /> : <Pause />}
      </IconButton>
      <IconButton title='Next frame [Right arrow]' onClick={playback.seekNext}>
        <FastForward />
      </IconButton>
      <IconButton title='End [Shift + Right arrow]' onClick={playback.seekEnd}>
        <SkipNext />
      </IconButton>
      <IconCheckbox
        title='Disable looping [L]'
        titleOff='Enable looping [L]'
        active={loop}
        onChange={playback.toggleLoop}
      >
        <Repeat />
      </IconCheckbox>
      <Input
        title='Current framerate'
        value={fps}
        postfix='FPS'
        onChange={(value) => {
          playback.fps = value;
        }}
        type='number'
        width='25px'
      />
      <IconButton title='Save snapshot'>
        <PhotoCamera />
      </IconButton>
      <Input
        title='Current framerate'
        value={maxlen}
        prefix='Maxlen '
        onChange={playback.setMaxlen}
        type='number'
        width='50px'
      />
      <IconButton
        title={recording ? 'Stop Recording' : 'Record'}
        onClick={() => playback.toggleRecording()}
      >
        <Recording active={recording} />
      </IconButton>
      <IconButton title='clear the key frames buffer' onClick={playback.clear}>
        <Trash />
      </IconButton>
    </div>
  );
}
