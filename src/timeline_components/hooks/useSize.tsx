import { MutableRefObject, useEffect, useLayoutEffect, useMemo, useState } from 'react';

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
  useLayoutEffect(() => {
    if (!targetRef.current) return;

    observer.observe(targetRef.current);
    return () => observer.unobserve(targetRef.current);
  }, [targetRef.current]);

  return rect;
}
