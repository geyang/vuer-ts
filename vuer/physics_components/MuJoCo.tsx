import { KeyFrame, MuJoCoModel, MuJoCoModelProps } from '@vuer-ai/mujoco-ts';
import { useCallback, useEffect, useState } from 'react';
import { ClientEvent, useSocket, VuerProps } from '../vuer';
import { UpsertOp } from '../vuer/eventHelpers';
import { Node } from '../vuer';
import { usePlayback, usePlaybackStates } from '../timeline_components';

export interface ON_MUJOCO_FRAME extends ClientEvent {
  value: { dt: number; keyFrame: KeyFrame };
}

export interface MuJoCoProps
  extends VuerProps<
    {
      /**
       * Frames per second for the MuJoCo frame events. The speed of the simulation
       * is controlled by the speed property in the MuJoCoModelProps.
       */
      fps?: number;
      /**
       * Staging the environment with fogs, lights and so on.
       */
      // stage?: boolean;
    } & MuJoCoModelProps
  > {}

/**
 * Represents the MuJoCo component within the Vuer application, facilitating the simulation and visualization of MuJoCo models.
 * This component is responsible for emitting frame update events (`ON_MUJOCO_FRAME`) to synchronize the simulation state across the application.
 *
 * Configures the MuJoCo simulation's behavior based on the playback's interaction state.
 *
 * The simulation's pause state and speed are dynamically adjusted to reflect the playback's
 * current action—recording, playing back, both, or neither. This ensures the simulation
 * accurately represents the desired scenario, with physics appropriately enabled or disabled.
 *
 *
 *
 * @param _ref A reference to the component instance, used for direct manipulation or access within the parent component.
 * @param _key A unique identifier for the MuJoCo simulation instance, defaulting to 'default'. This can be used to distinguish between multiple instances.
 * @param fps Frames per second for the simulation updates. This controls how often the `ON_MUJOCO_FRAME` events are emitted.
 * @param keyFrame The current key frame of the simulation. This is used to initialize the simulation state or to synchronize it with an external state.
 * @param pause A boolean indicating whether the simulation is currently paused. When true, frame updates are suspended.
 * @param speed The speed multiplier for the simulation. Allows for speeding up or slowing down the simulation playback.
 * @param props Additional props passed to the MuJoCo model component for further customization.
 */
export const MuJoCo = ({
  _ref,
  _key = 'mujoco-default',
  fps,
  keyFrame,
  pause,
  speed,
  // stage = true,
  ...props
}: MuJoCoProps) => {
  const { uplink, downlink, sendMsg } = useSocket();
  const [_keyFrame, setKeyFrame] = useState<KeyFrame | null>(null);

  const playback = usePlayback();
  const playbackState = usePlaybackStates();

  const {
    fps: pbFps,
    speed: pbSpeed,
    paused: pbPaused,
    recording,
  } = playbackState || { paused: false };

  const onFrame = useCallback(
    (frame: KeyFrame, delta: number) => {
      uplink?.publish({
        ts: Date.now(),
        etype: 'ON_MUJOCO_FRAME',
        value: { dt: delta, keyFrame: frame },
      } as ON_MUJOCO_FRAME);
    },
    [uplink],
  );

  useEffect(() => {
    // we apply mutation to the update events, to record it into our playback timeline.
    const cancel = uplink.subscribe(
      'ON_MUJOCO_FRAME',
      ({ ts, value }: ON_MUJOCO_FRAME) => {
        if (!playback.isRecording) return;
        playback.addKeyFrame(
          UpsertOp(
            [{ key: _key, tag: 'MuJoCo', keyFrame: value?.keyFrame } as Node],
            value?.keyFrame?.time || Date.now(),
          ),
        );
      },
    );

    return cancel;
  });

  // const [shouldPause, setPause] = useState<boolean | null>(null);
  //
  // useEffect(()=>{
  //   setPause(pause)
  // }, [pause]);
  //
  // useEffect(()=>{
  //   setPause(!recording)
  // }, [recording]);

  /**
   * if either one of these is true, it should pause.
   * if it is recording, this should definitely not be paused.
   * The precedences are:
   *
   * 1. if passed in directly it should obey, as long as it is not undefined or null
   * 2. if passed in null (None in python), it then falls to the player state:
   *    - If the player is recording, the physics should run.
   *    - if the player is not recording, the physics should stop.
   *    - if the player is not defined, such as in the index.html page (the main page),
   *      it should run as normal. But this will introduce power issues since this is
   *      the default. Maybe we should insert a button to control the state of the
   *      physics engine.
   *
   * Reference Implementation
   *
   * ```typescript
   *   let shouldPause;
   *   if (typeof pause !== 'undefined' && pause !== null) {
   *      shouldPause = pause;
   *   } else if (recording) {
   *      shouldPause = false;
   *   } else {
   *      shouldPause = pbPaused;
   *   }
   * ```
   */
  let shouldPause;
  if (typeof pause !== 'undefined' && pause !== null) {
    shouldPause = pause;
    console.info(
      `Simulation playback is ${pause ? 'paused' : 'running'} by MuJoCo(pause=${pause})`,
    );
  } else {
    shouldPause = pbPaused === true && !recording;
    shouldPause = !(pbPaused === false);
    if (recording) {
      shouldPause = false;
    }
  }

  return (
    /**
     * Renders the MuJoCoModel component with dynamic simulation control based on playback interaction.
     *
     * I think I need to decouple the visualization from the physics running in the background.
     * Assume that the physics is always running, and it gets updated events (keyFrames containing
     * control signals or actions from the server). There is the question of whether time should be
     * the browser time (real-time), or a timestamp provided by the server.
     *
     * Now, if the front end is playing back we should let the simulation running. If recording then
     * it gets addFrame'd to the history. If the front end is paused, we want to be able to both pause
     * the visualization, to inspect the paused frame, or to see what is happening with the physics at
     * real-time. This means we need to have an indicator for the physics' state.
     *
     * The component adjusts the simulation's physics and speed based on the playback's current action:
     * - **Recording only**: Physics is active to capture realistic movements.
     * - **Playing back only**: Physics is paused to accurately replay recorded movements without interference.
     * - **Recording and playing back**: Physics is paused to ensure playback accuracy, even while recording new data.
     * - **Neither recording nor playing back**: Physics is active for real-time interaction with the simulation.
     *
     * @param {Object} props - The props passed to the MuJoCoModel component.
     * @param {KeyFrame | null} keyFrame - The current key frame for the simulation.
     * @param {Function} onFrame - Callback function to handle frame updates.
     * @param {boolean} pause - Controls whether the simulation physics is paused.
     * @param {number} speed - Adjusts the simulation speed for playback or recording.
     */
    <MuJoCoModel
      keyFrame={keyFrame || _keyFrame}
      onFrame={onFrame}
      pause={shouldPause}
      fps={fps || pbFps}
      speed={pbSpeed}
      {...props}
    />
  );
};
