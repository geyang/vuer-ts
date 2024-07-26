import { Matrix16T, VuerProps } from '../../vuer/interfaces';
import { useLayoutEffect, useRef } from 'react';
import { Group as ThreeGroup } from 'three';

export type VuerGroupProps = VuerProps<{
  _ref?: React.MutableRefObject<ThreeGroup>;
  matrix?: Matrix16T;
}>;
export const VuerGroup = ({ _ref, _key, matrix, ...rest }: VuerGroupProps) => {
  const __ref = useRef<ThreeGroup>();
  const ref = _ref || __ref;

  useLayoutEffect(() => {
    const group = ref.current;
    if (!group) return;
    if (!!matrix) {
      group.matrix.fromArray(matrix);
      group.matrixAutoUpdate = false;
      // group.matrix.decompose(group.position, group.quaternion, group.scale);
      // group.rotation.setFromQuaternion(group.quaternion);
    }
    return () => {
      group.matrixAutoUpdate = true;
    };
  }, [matrix, ref.current]);

  return <group ref={ref} key={_key} {...rest} />;
};