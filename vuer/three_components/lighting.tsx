import { MutableRefObject, useLayoutEffect, useRef } from 'react';
import { useControls } from 'leva';
import { Sphere, useHelper } from '@react-three/drei';
import {
  AmbientLightProps as TALP,
  DirectionalLightProps as TDLP,
  HemisphereLightProps as HSLP,
  RectAreaLightProps as RALP,
  SpotLightProps as TSLP,
} from '@react-three/fiber';
import {
  AmbientLight as TAL,
  DirectionalLight as TDL,
  DirectionalLightHelper,
  HemisphereLightHelper,
  PointLight as TPL,
  PointLightHelper,
  SpotLight as TSL,
  SpotLightHelper,
  Vector3,
} from "three";
import { VuerProps } from "../vuer";

type LightProps<TLP> = VuerProps<{
  intensity?: number;
  hide?: boolean;
  levaPrefix?: string;
  helper?: boolean;
}, TLP>;

export function RectAreaLight(
  {
    _key,
     
    children,
    hide = false,
    intensity = 1.0,
    color = '#ffffff',
    levaPrefix = 'Scene.',
    lookAt = [ 0, 0, 0 ],
    ...rest
  }: LightProps<RALP> & { lookAt: [ number, number, number ] }
) {
  const lightRef = useRef() as MutableRefObject<RALP>;

  let prefix = levaPrefix ? `${levaPrefix}Rect Area Light` : 'Rect Area Light'
  prefix = _key ? `${prefix}-[${_key}]` : prefix;

  // @ts-ignore: leva is broken
  const controls = useControls(prefix, {
    intensity: { value: intensity, step: 0.05 },
    // @ts-ignore: leva is broken
    color,
    hide,
  }, [ intensity, color, hide ]);

  useLayoutEffect(() => {
    lightRef.current?.lookAt(new Vector3(...lookAt));
  }, [ lookAt ]);

  // @ts-ignore: leva is broken
  if (controls.hide) return null;
  // @ts-ignore: leva is broken
  return <rectAreaLight key={_key} ref={lightRef} {...controls} {...rest} />;
}


export function HemisphereLight(
  {
    _key,
     
    children,
    hide = false,
    intensity = 1.0,
    color = '#ffffff',
    levaPrefix = 'Scene.',
    helper = false,
    ...rest
  }: LightProps<HSLP>,
) {
  const lightRef = useRef() as MutableRefObject<HSLP>;

  let prefix = levaPrefix ? `${levaPrefix}Hemisphere Light` : 'Hemisphere Light'
  prefix = _key ? `${prefix}-[${_key}]` : prefix;

  // @ts-ignore: leva is broken
  const controls = useControls(prefix, {
    useHelper: helper,
    intensity: { value: intensity, step: 0.05 },
    // @ts-ignore: leva is broken
    color,
    hide,
  }, [ helper, intensity, color, hide ]);

  // @ts-ignore: leva is broken
  useHelper(controls.useHelper as boolean ? lightRef : null, HemisphereLightHelper, 1, 'red');

  // @ts-ignore: leva is broken
  if (controls.hide) return null;
  // @ts-ignore: leva is broken
  return <hemisphereLight key={_key} ref={lightRef} {...controls} {...rest} />;
}

export function DirectionalLight(
  {
    _key,
     
    children,
    hide = false,
    intensity = 0.5,
    color = '#ffffff',
    levaPrefix = 'Scene.',
    helper = false,
    ...rest
  }: LightProps<TDLP>,
) {
  const lightRef = useRef() as MutableRefObject<TDL>;

  let prefix = levaPrefix ? `${levaPrefix}Directional Light` : 'Directional Light'
  prefix = _key ? `${prefix}-[${_key}]` : prefix;

  // @ts-ignore: leva is broken
  const controls = useControls(prefix, {
    useHelper: helper,
    intensity: { value: intensity, step: 0.05 },
    // @ts-ignore: leva is broken
    color,
    hide,
  }, [ helper, intensity, color, hide ]);

  // @ts-ignore: leva is broken
  useHelper(controls.useHelper as boolean ? lightRef : null, DirectionalLightHelper, 1, 'red');

  // @ts-ignore: leva is broken
  if (controls.hide) return null;
  // @ts-ignore: leva is broken
  return <directionalLight key={_key} ref={lightRef} {...controls} {...rest} />;
}

export function AmbientLight(
  {
    _key,
     
    children,
    hide = false,
    intensity = 0.5,
    color = '#ffffff',
    levaPrefix = 'Scene.',

    ...rest
  }: LightProps<TALP>,
) {
  const lightRef = useRef() as MutableRefObject<TAL>;

  let prefix = levaPrefix ? `${levaPrefix}Ambient Light` : 'Ambient Light'
  prefix = _key ? `${prefix}-[${_key}]` : prefix;

  const controls = useControls(
    prefix,
    // @ts-ignore: leva is broken
    {
      intensity: { value: intensity, step: 0.05 },
      // @ts-ignore: leva is broken
      color,
      hide,
    },
    { collapsed: true }, [ intensity, color, hide ]
  );

  // @ts-ignore: leva is broken
  if (controls.hide) return null;
  // @ts-ignore: leva is broken
  return <ambientLight key={_key} ref={lightRef} {...controls} {...rest} />;
}

export function SpotLight(
  {
    _key,
     
    children,
    hide = false,
    intensity = 0.5,
    color = '#ffffff',
    levaPrefix = 'Scene.',
    helper = false,
    ...rest
  }: LightProps<TSLP>,
) {
  const lightRef = useRef() as MutableRefObject<TSL>;
  // @ts-ignore: todo: fix typing
  useHelper(helper ? lightRef : null, SpotLightHelper, 1, 'red');

  let prefix = levaPrefix ? `${levaPrefix}Spot Light` : 'Spot Light'
  prefix = _key ? `${prefix}-[${_key}]` : prefix;

  const controls = useControls(
    // @ts-ignore: leva typing is broken
    prefix, {
      intensity: { value: intensity, step: 0.05 },
      // @ts-ignore: leva is broken
      color,
      hide,
    }, [ intensity, color, hide ]);

  // @ts-ignore: leva typing is broken
  if (controls.hide) return null;
  // @ts-ignore: todo: fix typing
  return <spotLight key={_key} ref={lightRef} {...controls} {...rest} />;
}

type PointLightProps = LightProps<{
  radius?: number;
} & Omit<TPL, "radius">>;

export function PointLight(
  {
    _key,
     
    children,
    hide = false,
    intensity = 20,
    color = '#ffffff',
    levaPrefix = 'Scene.',
    helper = false,
    showSphere = false,
    radius = 0.1,
    ...rest
  }: PointLightProps,
) {
  const lightRef = useRef() as MutableRefObject<TPL>;
  useHelper(helper ? lightRef : null, PointLightHelper, 1, 'red');

  let prefix = levaPrefix ? `${levaPrefix}Point Light` : 'Point Light'
  prefix = _key ? `${prefix}-[${_key}]` : prefix;

  const controls = useControls(
    // @ts-ignore: this is fine
    prefix, {
      intensity: { value: intensity, step: 0.05 },
      // @ts-ignore: leva is broken
      color,
      hide,
    }, [ intensity, color, hide ]);

  // @ts-ignore: this is fine
  if (controls.hide) return null;
  return (
    <group>
      <pointLight key={_key} ref={lightRef} {...controls} {...rest} />
      {showSphere
        ? <Sphere
          args={[ radius as number, 32, 32 ]}
          // @ts-ignore: todo: fix this.
          position={rest.position}
          // @ts-ignore: todo: fix this.
          emissive={color}
          emissiveIntensity={intensity}
        /> : null
      }
    </group>
  );
}
