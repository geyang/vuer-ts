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
import { usePlayback } from "../player";
import { Trash } from "../icons/Trash";
import { useStorage } from "../hooks";
import { useEffect } from "react";

export function PlaybackControls() {
  const player = usePlayback();

  const [ fps, setFps ] = useStorage('vuer-fps', 60)
  const [ speed, setSpeed ] = useStorage('vuer-speed', 1)
  const [ maxlen, setMaxlen ] = useStorage('vuer-maxlen', 100)

  useEffect(() => {
    player.fps = fps
    player.speed = speed
    player.setMaxlen(maxlen)
  }, [ fps, speed, maxlen ])


  return (
    <div
      css={css`
          display: flex;
          justify-content: center;
          gap: 16px;
      `}>
      <Select
        title="Playback speed"
        options={[
          { value: 0.25, text: 'x0.25' },
          { value: 0.5, text: 'x0.5' },
          { value: 1, text: 'x1' },
          { value: 1.5, text: 'x1.5' },
          { value: 2, text: 'x2' },
        ]}
        value={player.speed}
        onChange={setSpeed}
      />
      <IconButton
        title="Start [Shift + Left arrow]"
        onClick={() => player.reset()}
      >
        <SkipPrevious/>
      </IconButton>
      <IconButton
        title="Previous frame [Left arrow]"
        onClick={() => player.seekPrevious()}
      >
        <FastRewind/>
      </IconButton>
      <IconButton
        title={player.isPaused ? "Pause [Space]" : "Play [Space]"}
        onClick={player.togglePlayback}
      >
        {player.isPaused ? <PlayArrow/> : <Pause/>}
      </IconButton>
      <IconButton
        title="Next frame [Right arrow]"
        onClick={player.seekNext}
      >
        <FastForward/>
      </IconButton>
      <IconButton
        title="End [Shift + Right arrow]"
        onClick={player.seekEnd}
      >
        <SkipNext/>
      </IconButton>
      <IconCheckbox
        titleOn="Disable looping [L]"
        titleOff="Enable looping [L]"
        checked={player.loop}
        onChange={player.toggleLoop}
      >
        <Repeat/>
      </IconCheckbox>
      <Input
        title="Current framerate"
        value={player.fps}
        postfix="FPS"
        onChange={setFps}
        type='number'
        width="25px"
      />

      <IconButton title="Save snapshot">
        <PhotoCamera/>
      </IconButton>

      <Input
        title="Current framerate"
        value={player.keyFrames.maxlen}
        prefix="Maxlen "
        onChange={setMaxlen}
        type='number'
        width="50px"
      />
      <IconButton
        title={player.isRecording ? 'Stop Recording' : 'Record'}
        onClick={() => player.toggleRecording()}
      >
        <Recording isRecording={player.isRecording}/>
      </IconButton>
      <IconButton
        title="clear the key frames buffer"
        onClick={player.clear}
      >
        <Trash/>
      </IconButton>
    </div>
  );
}
