// import { VNode } from 'preact';
// import { usePlayerTime } from '../../hooks';

interface CurrentTimeProps {
  // render: (time: number) => VNode<unknown>;
  time: number
}

export function CurrentTime({ time }: CurrentTimeProps) {
  // const time = usePlayerTime();

  return <div>{time}</div>;
}
