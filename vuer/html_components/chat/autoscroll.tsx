import { useEffect, useMemo, useRef } from 'react';
import { VuerProps } from '../../vuer/interfaces';

export function AutoScroll({ _key: key, children, ...props }: VuerProps) {
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = useMemo(() => () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 0.016);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [ children, scrollToBottom ]);

  return (
    <div key={key} {...props}>
      {children}
      <div ref={messagesEndRef} />
    </div>
  );
}
