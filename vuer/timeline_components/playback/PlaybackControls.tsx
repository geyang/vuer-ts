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

export function PlaybackControls() {
  // const { player, renderer, meta, project } = useApplication();
  // const state = usePlayerState();
  const state = {
    speed: 1,
    muted: false,
    volume: 1,
    paused: false,
    loop: false,
  }

  // useDocumentEvent(
  //   'keydown',
  //   useCallback(
  //     event => {
  //       if (document.activeElement.tagName === 'INPUT') {
  //         return;
  //       }
  //       switch (event.key) {
  //       case ' ':
  //         event.preventDefault();
  //         player.togglePlayback();
  //         break;
  //       case 'ArrowLeft':
  //         event.preventDefault();
  //         if (event.shiftKey) {
  //           player.requestReset();
  //           return;
  //         }
  //
  //         player.requestPreviousFrame();
  //         break;
  //       case 'ArrowRight':
  //         event.preventDefault();
  //         if (event.shiftKey) {
  //           player.requestSeek(Infinity);
  //           return;
  //         }
  //
  //         player.requestNextFrame();
  //         break;
  //       case 'm':
  //         player.toggleAudio();
  //         break;
  //       case 'ArrowUp':
  //         player.addAudioVolume(0.1);
  //         break;
  //       case 'ArrowDown':
  //         player.addAudioVolume(-0.1);
  //         break;
  //       case 'l':
  //         player.toggleLoop();
  //         break;
  //       }
  //     },
  //     [ player ],
  //   ),
  // );
  const player = usePlayback();

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
        value={state.speed}
        // onChange={speed => player.setSpeed(speed)}
      />
      <IconButton
        title="Start [Shift + Left arrow]"
        onClick={() => player.requestReset()}
      >
        <SkipPrevious/>
      </IconButton>
      <IconButton
        title="Previous frame [Left arrow]"
        onClick={() => player.requestPreviousFrame()}
      >
        <FastRewind/>
      </IconButton>
      <IconCheckbox
        titleOn="Pause [Space]"
        titleOff="Play [Space]"
        checked={!player.isPaused}
        onChange={player.togglePlayback}
      >
        {player.isPaused ? <PlayArrow/> : <Pause/>}
      </IconCheckbox>
      <IconButton
        title="Next frame [Right arrow]"
        onClick={() => player.requestNextFrame()}
      >
        <FastForward/>
      </IconButton>
      <IconButton
        title="End [Shift + Right arrow]"
        onClick={() => player.requestSeek(Infinity)}
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
      {/*<Framerate*/}
      {/*  render={(framerate, paused) => (*/}
      <Input
        title="Current framerate"
        style={{ width: '100px' }}
        value={player.isPaused ? 'PAUSED' : `${player.fps} FPS`}
      />
      {/*  )}*/}
      {/*/>*/}
      <IconButton
        title="Save snapshot"
        // onClick={() =>
        //   renderer.renderFrame(
        //     {
        //       ...meta.getFullRenderingSettings(),
        //       name: project.name,
        //     },
        //     player.status.time,
        //   )
        // }
      >
        <PhotoCamera/>
      </IconButton>
      <IconButton
        title={player.isRecording ? 'Stop Recording' : 'Record'}
        onClick={() => player.toggleRecording()}
      >
        <Recording isRecording={player.isRecording}/>
      </IconButton>
    </div>
  );
}
