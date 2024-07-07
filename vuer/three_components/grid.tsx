import { ReactFragment, ReactNode, useMemo } from 'react';
import queryString from 'query-string';
import { Grid as DreiGrid } from '@react-three/drei';
import { useControls } from 'leva';
import { useThree } from '@react-three/fiber';
import { document } from '../third_party/browser-monads';
import { Euler, Object3D, Quaternion, Vector3 } from "three";

interface GridQueries {
  grid?: string;
}

interface GridProps {
  _key?: string;
  far?: number;
  levaPrefix?: string;
  hide?: boolean;
}

/**
 * Grid component
 *
 * @param far - The far plane of the camera, deliminates the fade distance
 * @param levaPrefix - The prefix for the leva controls
 * @param show - Whether to show the grid
 * */
export function Grid({ _key, far, levaPrefix = 'Scene.', hide }: GridProps): ReactNode | Iterable<ReactNode> {
  const q = useMemo<GridQueries>(
    () => queryString.parse(document.location.search),
    [],
  );
  const { camera } = useThree();

  const queryGrid = (q.grid?.toLowerCase() === 'false') ? false : true;

  let prefix = levaPrefix ? `${levaPrefix}Grid Plane` : 'Grid Plane'
  prefix = _key ? `${prefix}-[${_key}]` : prefix;

  const {
    showGrid, offset, fadeDistance, ...config
  } = useControls(
    prefix, {
      showGrid: {
        value: (typeof hide === 'undefined') ? queryGrid : hide,
        label: 'Show Grid',
      },
      offset: 0,
      cellSize: 0.2,
      cellThickness: 0.6,
      cellColor: '#6f6f6f',
      sectionSize: 1.0,
      sectionThickness: 1.5,
      sectionColor: '#23aaff',
      fadeDistance: far || 10,
      fadeStrength: 1,
      followCamera: true,
      infiniteGrid: true,
    },
    { collapsed: true },
    [ far, camera.far ],
  );

  const { rot, pos } = useMemo(() => {
    const upVector = new Vector3(0, 1, 0);

    // Compute the quaternion
    const quaternion = new Quaternion();
    quaternion.setFromUnitVectors(upVector, Object3D.DEFAULT_UP);

    const euler = new Euler()
    euler.setFromQuaternion(quaternion, 'XYZ');
    const position = Object3D.DEFAULT_UP.clone().multiplyScalar(offset);
    return { rot: euler, pos: position };
  }, [ Object3D.DEFAULT_UP, offset ])

  if (!showGrid) return <></>;
  return (
    <DreiGrid
      position={pos}
      rotation={rot}
      args={[ 10, 10 ]}
      fadeDistance={Math.min(camera.far || 5, fadeDistance)}
      {...config}
    />
  );
};
