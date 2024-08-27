/** Component Registry
 *
 * - This file is used to register all the components that are available to the user.
 *
 * todo: need to change this into a factory function and a registry object.
 */
import React, { ReactNode } from 'react';
import { Node } from './vuer';
import { Hydrate } from './vuer/Hydrate.tsx';

export * from "./drei_components";
export * from "./three_components";
export * from "./physics_components";
export * from "./timeline_components";
export * from "./html_components";

export { Render, RenderLayer } from './nerf_components/view';
export { Markdown } from './html_components/markdown/markdown';
export { AutoScroll } from './html_components/chat/autoscroll';
export { Button, Div, ImageUpload, Img, Input, Slider, Text } from "./html_components/input_components";
export { TimelineControls } from "./uxr_components/TimelineControls";

export const Splats = React.lazy(() => import('./third_party/luma_splats' ))

export function hydrate(data: string | string[] | Node | Node[] | null): ReactNode[] {
  /** if data=='' this also works out */
  if (!data || data.length === 0) return null;
  const nodeArray = Array.isArray(data) ? data : [data];
  return nodeArray.map((node: Node | string) => {
    if (typeof node === 'string') return node;
    else {
      const { key, ...child } = node;
      return <Hydrate key={key} _key={key} {...child} />;
    }
  });
}