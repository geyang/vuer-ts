import { ForwardedRef, forwardRef, MutableRefObject, ReactNode, useMemo, useRef, } from 'react';
import { Interactive, XRController, XRInteractionEvent } from '@react-three/xr';
import { useFrame } from '@react-three/fiber';

import { Group, Matrix4 } from 'three';
import { VuerProps } from "../../vuer/interfaces";

type SqueezeRayGrabProps = VuerProps<{
  onSqueezeStart?: (e?: XRInteractionEvent) => void;
  onSqueezeEnd?: (e?: XRInteractionEvent) => void;
  onMove?: (e?: { world: Matrix4; local: Matrix4 }) => void;
  onSelect?: (e?: XRInteractionEvent) => void;
  bgChildren?: ReactNode | ReactNode[];
  [key: string]: unknown;
}, Group>;

export const SqueezeRayGrab = forwardRef((
  {
    onSqueezeStart,
    onMove,
    onSqueezeEnd,
    onSelect,
    children,
    bgChildren,
    ...rest
  }: SqueezeRayGrabProps,
  forwardedRef: ForwardedRef<Group>,
) => {
  const ref = useRef<Group>();
  const groupRef = (forwardedRef || ref) as MutableRefObject<Group>;
  const grabbingController = useRef() as MutableRefObject<XRController | null>;

  const previousTransform = useMemo(() => new Matrix4(), []);

  useFrame(() => {
    const controller = grabbingController.current;
    if (!groupRef.current || !controller) return null;

    const group = groupRef.current;

    group.applyMatrix4(previousTransform);
    group.applyMatrix4(controller.matrixWorld);
    group.updateMatrixWorld();

    previousTransform.copy(controller.matrixWorld).invert();

    onMove?.({ world: controller.matrixWorld, local: controller.matrix });

  });

  return (
    <group ref={groupRef}>
      {bgChildren}
      <Interactive
        onSqueezeStart={(e: XRInteractionEvent) => {
          // @ts-expect-error: not sure how to fix this
          grabbingController.current = e.target.controller;
          previousTransform.copy(e.target.controller.matrixWorld).invert();
          onSqueezeStart?.(e);
        }}
        onSqueezeEnd={(e: XRInteractionEvent) => {
          // @ts-expect-error: not sure how to fix this
          if (e.target.controller === grabbingController.current) {
            grabbingController.current = null;
          }
          onSqueezeEnd?.(e);
        }}
        onSelect={(e) => {
          onSelect?.(e);
        }}
        {...rest}
      >
        {children}
      </Interactive>
    </group>
  );
});
