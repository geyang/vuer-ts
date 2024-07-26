import { useCallback, useMemo, useState } from 'react';

export function useStorage<T>(
  id: string,
  initialState: T = null,
  collection = 'vuer-default',
): [T, (newState: T) => void, boolean] {
  // const name = useApplication().project.name;
  const key = `${collection}-${id}`;
  const [savedState, wasLoaded] = useMemo(() => {
    console.log('loading', key);
    const savedState = localStorage.getItem(key);
    console.log('loaded', key, savedState);
    try {
      console.log('parsing', key);
      const parsed = JSON.parse(savedState);
      console.log('parsed', key, parsed);
      return savedState ? [parsed, true] : [initialState, false];
    } catch (e) {
      console.error('Error parsing storage', key, savedState, e);
      return [initialState, false];
    }
  }, [key]);
  const [state, setState] = useState<T>(savedState);

  const updateState = useCallback(
    (newState: T) => {
      if (key) {
        localStorage.setItem(key, JSON.stringify(newState));
      }
      setState(newState);
    },
    [setState, key],
  );

  return [state, updateState, wasLoaded];
}
