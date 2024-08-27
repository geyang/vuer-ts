import { MutableRefObject, useCallback } from 'react';
import { useDocumentEvent } from './useDocumentEvent';

export function useClickOutside<T extends Element>(
  targetRef: MutableRefObject<T>,
  onClick: () => void,
) {
  useDocumentEvent(
    'click',
    useCallback(
      (event) => {
        if (
          targetRef.current &&
          !targetRef.current.contains(event.target as Node)
        ) {
          onClick();
        }
      },
      [targetRef.current, onClick],
    ),
  );
}
