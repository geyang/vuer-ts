import { MuJoCoModel, MuJoCoModelProps, KeyFrame } from '@vuer-ai/mujoco-ts';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ClientEvent, useSocket, VuerProps } from '../vuer';
import { throttle } from '../timeline_components/timeline/throttle';
import { usePlayback } from '../timeline_components/playback';
import { UpdateOp } from '../vuer/eventHelpers';
import { Node } from '../vuer/interfaces';
import { useComputed, useSignalEffect } from '@preact/signals-react';
import playback from '../../../mujoco-ts/example/src/routes/Playback';

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
  _key = 'default',
  fps,
  keyFrame,
  pause,
  speed,
  ...props
}: MuJoCoProps) => {
  const { uplink, downlink, sendMsg } = useSocket();
  const [_keyFrame, setKeyFrame] = useState<KeyFrame | null>(null);

  const {
    playback,
    fps: simFps,
    speed: simSpeed,
    paused: simPaused,
    recording ,
  } = usePlayback();

  const onFrame = useCallback(
    (frame: KeyFrame, delta: number) => {
      console.log('onFrame');
      uplink?.publish({
        ts: Date.now(),
        etype: 'ON_MUJOCO_FRAME',
        value: { dt: delta, keyFrame: frame },
      } as ON_MUJOCO_FRAME);
    },
    [uplink],
  );

  useSignalEffect(() => {
    const cancel = [
      // we apply mutation to the update events, to record it into our playback timeline.
      uplink.subscribe('ON_MUJOCO_FRAME', ({ ts, value }: ON_MUJOCO_FRAME) => {
        if (!playback.isRecording.value) return;
        playback.addKeyFrame(
          UpdateOp(
            [{ key: _key, tag: 'MuJoCo', keyFrame: value.keyFrame } as Node],
            ts,
          ),
        );
      }),
    ];

    return () => {
      cancel.forEach((f) => f());
    };
  });

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
      pause={!recording}
      speed={1}
      {...props}
    />
  );
};
