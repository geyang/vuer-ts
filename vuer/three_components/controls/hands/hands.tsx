import { MutableRefObject, ReactNode, useCallback, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import throttle from 'lodash.throttle';
import { useController, useXR } from '@react-three/xr';

import { ClientEvent, VuerProps } from '../../../vuer';
import { SocketContextType, useSocket } from '../../../vuer';
import { Group } from 'three';

const HAND_MODEL_JOINT_KEYS = [
  'wrist',
  'thumb-metacarpal',
  'thumb-phalanx-proximal',
  'thumb-phalanx-distal',
  'thumb-tip',
  'index-finger-metacarpal',
  'index-finger-phalanx-proximal',
  'index-finger-phalanx-intermediate',
  'index-finger-phalanx-distal',
  'index-finger-tip',
  'middle-finger-metacarpal',
  'middle-finger-phalanx-proximal',
  'middle-finger-phalanx-intermediate',
  'middle-finger-phalanx-distal',
  'middle-finger-tip',
  'ring-finger-metacarpal',
  'ring-finger-phalanx-proximal',
  'ring-finger-phalanx-intermediate',
  'ring-finger-phalanx-distal',
  'ring-finger-tip',
  'pinky-finger-metacarpal',
  'pinky-finger-phalanx-proximal',
  'pinky-finger-phalanx-intermediate',
  'pinky-finger-phalanx-distal',
  'pinky-finger-tip',
];

function getPoses(hand): number[][] {
  if (!hand?.joints) return [];
  return HAND_MODEL_JOINT_KEYS.map((k) => hand.joints[k]?.position?.toArray());
}

export type HandsProps = VuerProps<{
  fps?: number;
  left?: boolean;
  right?: boolean;
  showLeft?: boolean;
  showRight?: boolean;
  stream?: boolean;
}>;

export type HandsData = Record<
  | 'keys'
  | 'leftLandmarks'
  | 'leftHand'
  | 'leftState'
  | 'rightLandmarks'
  | 'rightHand'
  | 'rightState',
  object | number[][]
>;

/**
 * Hands component
 *
 * This component is an event listener for the hands. This is separate from the
 * hands component in the @react-three/xr package. This component is used to send
 * messages to the server when the hands are moved or when the hands are used to
 * interact with the scene.
 *
 * @param {string} _key - the key for the component, set to hands by default on the python side.
 * @param {boolean} left - If selected, suppresses the right hand.
 * @param {boolean} right - If selected, suppresses the left hand.
 * @param {boolean} stream - whether to stream the hand data to the server. Off by default.
 * @param {number} fps - the frames per second for the hand data.
 * @param {VuerProps} _ - the rest of the props.
 * */
function Hands({
  _key = 'hands',
  children,
  fps = 30,
  left: useLeft,
  right: useRight,
  showLeft = true,
  showRight = true,
  stream = false,
  ..._
}: HandsProps): ReactNode {
  const { sendMsg } = useSocket() as SocketContextType;
  const { isPresenting } = useXR();

  const leftHandRef = useRef() as MutableRefObject<Group>;
  const rightHandRef = useRef() as MutableRefObject<Group>;

  /* these are the two hands*/
  const left = useController('left');
  const right = useController('right');
  /* this is the gaze controller -- where you look at. */
  const gaze = useController('none');

  const ctrlMap = { left, right, gaze };

  const onFrame = useCallback(
    throttle(
      (): void => {
        const poseData = {
          keys: HAND_MODEL_JOINT_KEYS,
        } as HandsData;
        // these two are exclusive
        if (!useRight) {
          poseData.leftLandmarks = getPoses(left?.hand);
          poseData.leftHand = left?.hand?.joints.wrist?.matrix?.toArray();
          poseData.leftState = left?.hand?.inputState;
        }
        if (!useLeft) {
          poseData.rightLandmarks = getPoses(right?.hand);
          poseData.rightHand = right?.hand?.joints.wrist?.matrix?.toArray();
          poseData.rightState = right?.hand?.inputState;
        }

        setTimeout(
          () =>
            sendMsg({
              ts: Date.now(),
              etype: 'HAND_MOVE',
              key: _key,
              value: poseData,
            } as ClientEvent),
          0,
        );
      },
      1000 / fps,
      { leading: true, trailing: true },
    ),
    [fps, sendMsg, isPresenting, left, right, gaze, useLeft, useRight, stream],
  );

  useFrame(function (state) {
    // render hand components
    if (!isPresenting) return;

    const leftJoints = left?.hand?.joints as unknown[];
    const rightJoints = right?.hand?.joints as unknown[];

    const leftVisual = leftHandRef.current as Group;
    const rightVisual = rightHandRef.current as Group;

    const leftVisible = !useRight && !!left?.hand.visible;
    const rightVisible = !useLeft && !!right?.hand.visible;

    if (leftVisual) leftVisual.visible = leftVisible;
    if (rightVisual) rightVisual.visible = rightVisible;
    if (!left?.hand.visible && !right?.hand.visible) return;

    HAND_MODEL_JOINT_KEYS.forEach((k, i) => {
      if (leftJoints && leftVisual) {
        leftVisual.children[i].position.copy(leftJoints[k]?.position);
        leftVisual.children[i].rotation.copy(leftJoints[k]?.rotation);
      }
      if (rightJoints && rightVisual) {
        rightVisual.children[i].position.copy(rightJoints[k]?.position);
        rightVisual.children[i].rotation.copy(rightJoints[k]?.rotation);
      }
    });
    if (!stream) return;
    onFrame();
  });

  // if (!left && !right) return <DreiHands/>;
  if (!isPresenting || (!left && !right)) return null;
  return (
    <group>
      {useRight || !showLeft ? null : (
        <group ref={leftHandRef}>
          {HAND_MODEL_JOINT_KEYS.map((jointName, i) => (
            <mesh key={jointName}>
              <boxGeometry args={[0.01, 0.01, 0.01]} />
              <meshStandardMaterial
                attach='material'
                color='#ff4444'
                roughness={0.1}
              />
            </mesh>
          ))}
        </group>
      )}
      {useLeft || !showRight ? null : (
        <group ref={rightHandRef}>
          {HAND_MODEL_JOINT_KEYS.map((jointName, i) => (
            <mesh key={jointName}>
              <boxGeometry args={[0.01, 0.01, 0.01]} />
              <meshStandardMaterial
                attach='material'
                color='#23aaff'
                roughness={0.1}
              />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
  // you can add custom GLB models to the hands
  // return <BareHands key={key} {...rest} />;
}

export { Hands };