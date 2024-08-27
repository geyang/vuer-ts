import { ElementType, ReactNode, useContext } from 'react';
import { AppContext } from './VuerRoot';
import * as comp_list from '../core_components';
import { Node } from './interfaces';

export interface HydrateProps {
  _key?: string;
  tag: string;
  className?: string;
  children?: Node[] | string[] | undefined | null;

  [key: string]: unknown;
}

export function Hydrate({
  _key,
  tag,
  children,
  className,
  ...rest
}: HydrateProps): ReactNode | null | undefined {
  const Component = (comp_list[tag] || tag) as ElementType;

  const { showWarning } = useContext(AppContext);

  if (!tag) {
    showWarning(
      `No tag provided for component <${tag} ${_key} className="${className}">${children} </...>`,
    );
    return children as string[];
  }

  const hydratedChildren = (children || []).map((child: Node | string) => {
    if (typeof child === 'string') return child;

    const { key, ..._child } = child;
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