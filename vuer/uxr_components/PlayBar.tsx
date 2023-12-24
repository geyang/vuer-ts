import { useThree } from "@react-three/fiber";
import { useSpring, animated } from "@react-spring/three";
import { useGesture } from "react-use-gesture";

export type PlayBarProps = {
  camCtrlRef: React.MutableRefObject<unknown>;
}

export function PlayBar({ camCtrlRef }: PlayBarProps) {
  const { size, viewport } = useThree()
  const aspect = size.width / viewport.width
  const [ spring, set ] = useSpring(() => ({
    scale: [ 1, 1, 1 ],
    position: [ 0, 0, 0 ],
    rotation: [ 0, 0, 0 ],
    // config: { friction: 10 }
  }))
  const bind = useGesture({
    onDrag: ({ offset: [ x, y ] }) => set({
      position: [ -x / aspect, y / aspect, 0 ],
    }),
    onHover: ({ hovering }) => {
      camCtrlRef.current.enabled = !hovering;
      set({ scale: hovering ? [ 1.2, 1.2, 1.2 ] : [ 1, 1, 1 ] })
    }
  })
  return (
    <animated.mesh {...spring} {...bind()} castShadow>
      <boxGeometry args={[ 0.1, 0.1, 0.1 ]}/>
      <meshStandardMaterial color="hotpink"/>
    </animated.mesh>
  )
}
