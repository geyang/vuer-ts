/** Component Registry
 *
 * - This file is used to register all the components that are available to the user.
 *
 * todo: need to change this into a factory function and a registry object.
 */
import React from 'react';
export { Scene } from './three_components/scene';
export { Glb, Glb as Gltf, Obj, Pcd, Ply, Urdf, } from './three_components/data_loaders';

export {
  Box,
  Capsule,
  Circle,
  Cone,
  Cylinder,
  Dodecahedron,
  Edges,
  Extrude,
  Icosahedron,
  Lathe,
  Octahedron,
  Plane,
  Polyhedron,
  Ring,
  Shape,
  Sphere,
  Tetrahedron,
  Torus,
  TorusKnot,
  Tube,
  Wireframe,
} from './three_components/primitives/primitives';
export { Gripper, SkeletalGripper } from './three_components/components';
export { Movable, Pivot } from './three_components/controls/movables';
export { Camera } from './three_components/camera';
export { BBox } from './three_components/primitives/bbox';
export { CameraView } from './three_components/camera_view/camera_view';
export {
  AmbientLight,
  DirectionalLight,
  HemisphereLight,
  PointLight,
  RectAreaLight,
  SpotLight,
} from './three_components/lighting';
export { Frustum } from './three_components/frustum';
export { Render, RenderLayer } from './nerf_components/view';
export { Markdown } from './html_components/markdown/markdown';
export { AutoScroll } from './html_components/chat/autoscroll';
export { PointCloud } from './three_components/primitives/pointcloud';
export { TriMesh } from './three_components/primitives/trimesh';
export { Gamepad } from './three_components/controls/gamepad';
export { Hands } from './three_components/controls/hands/hands';
export { SceneBackground } from './three_components/scene_background';
export { default as ImagePlane } from './three_components/image_plane';
export { HUDPlane, VideoPlane, WebRTCVideoPlane } from './three_components/video_plane';
export { StereoVideoPlane, WebRTCStereoVideoPlane } from './three_components/primitives/video_display/StereoVideoPlane';
export { VideoMaterial, WebRTCVideoMaterial } from "./three_components/primitives/video_display/WebRTCVideoMaterial";
export { ImageBackground } from './three_components/image_background';
export { Arrow, CoordsMarker } from "./three_components/primitives/CoordsMarker";
export { Button, Div, ImageUpload, Img, Input, Slider, Text } from "./html_components/input_components";
export { default as GrabRender } from "./three_components/camera_view/GrabRender";
export { PointerControls } from "./three_components/controls/pointer";
export * from "./drei_components";
export { VuerGroup } from "./three_components/primitives/better_group";
export { Grid } from "./three_components/grid";
export { default as SceneContainer } from "./three_components";
export { Resizable } from "./layout_components/Resizable";
export { TimelineControls } from "./uxr_components/TimelineControls";

// eslint-disable-next-line react-refresh/only-export-components
export * from "./timeline_components";

export const Splats = React.lazy(() => import( './third_party/luma_splats' ))