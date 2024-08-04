import { useCallback, useMemo } from 'react';
import useStateRef from 'react-usestateref';

export function useStorage<T>(
  id: string,
  initialState: T = null,
  collection = 'vuer-default',
): [T, (newState: T) => void, boolean] {
  const key = `${collection}-${id}`;

  const [savedState, savedString, wasLoaded] = useMemo(() => {
    const saved = localStorage.getItem(key);

    // null means the key doesn't exist.
    if (saved === null) {
      const serialized = JSON.stringify(initialState);
      localStorage.setItem(key, serialized);
      console.log('initialized', key, serialized);
      return [initialState, serialized, false];
    } else {
      const parsedState = JSON.parse(saved);
      console.log('loaded', key, saved);
      return [parsedState, saved, true];
    }
  }, [key]);

  const [state, setState, stateRef] = useStateRef<T>(savedState);
  const [serialized, setSerialized, serRef] = useStateRef<string>(savedString);

  const updateState = useCallback(
    (value: T) => {
      if (typeof value === 'function') value = value(stateRef.current);

      const valueStr = JSON.stringify(value);

      if (valueStr !== serRef.current && key) {
        localStorage.setItem(key, valueStr);
        setState(value);
        setSerialized(valueStr);
        console.log('saved', key, [serRef.current]);
      }
    },
    [key, setState, serRef],
  );

  return [state, updateState, wasLoaded];
}
