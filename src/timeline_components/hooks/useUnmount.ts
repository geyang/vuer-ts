import { useRef } from 'react';
import useEffectOnce from './useEffectOnce';

export const useUnmount = (fn: () => void): void => {
  const fnRef = useRef(fn);

  // update the ref each render to save the newest callback
  fnRef.current = fn;

  useEffectOnce(() => () => fnRef.current());
};
