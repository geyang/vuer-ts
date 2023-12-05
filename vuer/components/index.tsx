import { ElementType } from 'react';
import { comp_list } from './components.tsx';
import { Node } from '../index';

type HydrateProps = {
  _key?: string;
  tag: string;
  className: string;
  children?: Node[] | string[] | undefined | null;
  [key: string]: unknown;
};

export function Hydrate(
  {
    _key,
    tag: Tag = 'div',
    children,
    className,
    ...rest
  }: HydrateProps,
): JSX.Element {
  const Component = (comp_list[Tag] || Tag) as ElementType;
  // const {sendMsg} = useContext<SocketContextType>(SocketContext);

  const hydratedChildren = (children || []).map((child: Node | string) => {
    if (typeof child === 'string') return child;
    const { key, ..._child } = child;
    // @ts-ignore: not sure how to fix this;
    return <Hydrate key={key} _key={key} {..._child} />;
  });

  if (typeof Component === 'string') {
    return (
    // @ts-ignore: not sure how to fix this;
      <Component key={_key} className={className} {...rest}>
        {hydratedChildren}
      </Component>
    );
  }
  return (
    <Component
      key={_key}
      _key={_key}
      className={className}
      // sendMsg={sendMsg}
      {...rest}
    >
      {hydratedChildren}
    </Component>
  );
}