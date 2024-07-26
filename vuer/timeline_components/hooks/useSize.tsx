import { MutableRefObject, useEffect, useMemo, useState } from 'react';

export function useSize<T extends Element>(
  targetRef: MutableRefObject<T>,
): DOMRectReadOnly {
  const [rect, setRect] = useState<DOMRect>(new DOMRect());
  const observer = useMemo(
    () =>
      new ResizeObserver(() =>
        setRect(targetRef.current.getBoundingClientRect()),
      ),
    [],
  );
  useEffect(() => {
    const { current } = targetRef;
    observer.observe(current);
    return () => observer.unobserve(current);
  }, [targetRef.current]);

  return rect;
}
