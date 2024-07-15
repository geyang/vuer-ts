/** Component Registry
 *
 * - This file is used to register all the components that are available to the user.
 *
 * todo: need to change this into a factory function and a registry object.
 */
import React from 'react';

export { Render, RenderLayer } from './nerf_components/view';
export { Markdown } from './html_components/markdown/markdown';
export { AutoScroll } from './html_components/chat/autoscroll';
export { Button, Div, ImageUpload, Img, Input, Slider, Text } from "./html_components/input_components";
export * from "./drei_components";
export * from "./three_components";
export { TimelineControls } from "./uxr_components/TimelineControls";

// eslint-disable-next-line react-refresh/only-export-components
export * from "./timeline_components";

export const Splats = React.lazy(() => import( './third_party/luma_splats' ))