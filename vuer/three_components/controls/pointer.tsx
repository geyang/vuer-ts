import { MutableRefObject, RefObject, useContext, useEffect, useLayoutEffect, useRef, } from 'react';
import { Mesh, Object3D, Raycaster, Vector2, Vector3, } from 'three';
import { Camera, Intersection, invalidate, useThree, } from '@react-three/fiber';
import { Sphere as ThreeSphere } from '@react-three/drei';
import { useControls } from 'leva';
import { SocketContext } from "../../vuer/websocket";

function getPosition(
  camera: Camera,
  raycaster: Raycaster,
  pointer: Vector2,
  children: Object3D[],
  average?: number,
): Vector3 | void {
  raycaster.setFromCamera(pointer, camera);
  const intersections = raycaster.intersectObjects(children, true);
  if (average) {
    const head = intersections.slice(0, average) as Intersection[];
    const pos = head.reduce(
      (pos, { point }) => pos.add(point),
      new Vector3(0, 0, 0),
    );
    return pos.divideScalar(head.length);
  }
  if (intersections) return intersections[0].point;
}

function flattenGroups(children: Object3D[]): Object3D[] {
  return children.reduce((acc: Object3D[], child: Object3D) => {
    if (child.type === 'Group') {
      return acc.concat(flattenGroups(child.children));
    }
    return acc.concat(child);
  }, []);
}

interface ClickEvent {
  position: Vector3;
  radius: number;
  x: number;
  y: number;
  offsetX: number;
  offsetY: number;
  offsetHeight: number;
  offsetWidth: number;
}

interface PointerProps {
  parent: RefObject<HTMLElement>;
  thres: number;
  color?: string;
  onClick?: (e: ClickEvent) => void;
  childSelector?: (e: Object3D) => boolean;
  average?: number;
  disable?: boolean;
}

interface PointerState {
  is_down: boolean;
  pos?: Vector3;
}

export function Pointer(
  {
    parent,
    thres = 0.01,
    color = 'red',
    onClick,
    childSelector = ({ type }) => type === 'Points',
    average,
    disable = false,
  }: PointerProps,
) {
  const {
    scene, camera, raycaster, pointer,
  } = useThree();
  const ref = useRef() as MutableRefObject<Mesh>;

  useEffect(() => {
    raycaster.params.Points.threshold = thres;

    const state: PointerState = { is_down: false };

    const downHandle = () => {
      state.is_down = true;
    };
    const upHandle = () => {
      state.is_down = false;
    };
    const moveHandle = () => {
      /* do not cast when moving the mouse, for better performance */
      if (state.is_down) return;
      const children: Object3D[] = flattenGroups(scene.children).filter(childSelector);
      const pos = getPosition(camera, raycaster, pointer, children, average) as unknown;
      state.pos = pos as Vector3;
      ref.current.position.set(...pos as [ number, number, number ]);
      /* restart the render loop in on-demand mode */
      invalidate();
    };

    // multiple old handlers are not removed.
    const clickHandle = (e: MouseEvent) => {
      // need to clone the object, otherwise it changes.
      if (typeof onClick !== 'function') return;
      const target = e.target as HTMLElement;
      onClick({
        position: ref.current.position.clone(),
        radius: thres,
        x: e.offsetX / target.offsetWidth,
        y: e.offsetY / target.offsetHeight,
        offsetX: e.offsetX,
        offsetY: e.offsetY,
        offsetHeight: target.offsetHeight,
        offsetWidth: target.offsetWidth,
      } as ClickEvent);
    };

    parent.current?.addEventListener('mousedown', downHandle);
    parent.current?.addEventListener('mouseup', upHandle);
    parent.current?.addEventListener('mousemove', moveHandle);
    parent.current?.addEventListener('click', clickHandle);

    // remove the handler
    return () => {
      parent.current?.removeEventListener('mousedown', downHandle);
      parent.current?.removeEventListener('mouseup', upHandle);
      parent.current?.removeEventListener('mousemove', moveHandle);
      parent.current?.removeEventListener('click', clickHandle);
    };
  }, [ thres, onClick, disable ]);

  return (
    <ThreeSphere ref={ref} args={[ thres ]}>
      {/* basicMaterial does not require lighting */}
      <meshBasicMaterial color={color} opacity={1} transparent/>
    </ThreeSphere>
  );
}

interface PointerControlProps {
  parentKey?: string;
  parent?: RefObject<HTMLElement>;
}

export function PointerControls({
  parentKey,
  parent,
}: PointerControlProps) {

  const { gl } = useThree();
  const localRef = useRef() as MutableRefObject<HTMLElement>;

  useLayoutEffect(() => {
    if (!parent) localRef.current = gl.domElement;
  }, []);

  const ref = parent || localRef;

  const { sendMsg } = useContext(SocketContext);
  const {
    enableMarker, markerSize, markerAvg, color,
  } = useControls(
    'Scene.Pointer',
    {
      color: 'red',
      enableMarker: { value: false, label: 'Enable' },
      markerSize: {
        value: 10,
        min: 0.1,
        max: 100,
        step: 0.1,
        pad: 1,
        label: 'Pointer Size',
      },
      markerAvg: {
        value: 5, min: 0, max: 20, step: 1, label: 'Average k',
      },
    },
    { collapsed: true },
  );

  const addMarker = ({
    position,
    radius,
    x,
    y,
    ..._rest
  }: ClickEvent) => {
    let event;

    // Skip if position (Vector3D) contains NaN
    if (
      !position
      || position.x !== position.x
      || position.y !== position.y
      || position.z !== position.z
    ) {
      // console.log('Clicked on free space, return as mouse click event.', _rest);
      event = {
        etype: 'MOUSE_CLICK',
        key: parentKey,
        // note: change to clientX/Y, and use layer X/Y etc.
        value: { pointerX: x, pointerY: y, ..._rest },
      };
    } else {
      event = {
        etype: 'ADD_MARKER',
        key: parentKey,
        value: {
          position, radius, pointerX: x, pointerY: y, ..._rest,
        },
      };
    }
    if (typeof sendMsg === 'function') sendMsg(event);
  };
  return (
    <Pointer
      parent={ref}
      thres={markerSize / 1000}
      onClick={addMarker}
      average={markerAvg}
      disable={!enableMarker as boolean}
      color={color}
    />
  );
}
