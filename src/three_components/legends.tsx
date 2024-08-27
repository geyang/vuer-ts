// todo: add Merged
// todo: add instancing
// Lots of non-sense spitted out by GPT-4
// export function Arrow({
//   length = 4,
//   radius = 0.1,
//   headHeight = 1,
//   headRadius = 0.3,
//   shaftColor = "blue",
//   headColor = "red",
//   ...restProps
// }) {
//   return (
//     <mesh {...restProps}>
//       <Merged meshes={[cylinder, cone]}>
//         {(Cylinder, Cone) => (
//           <>
//             <Cylinder
//               args={[radius, radius, length, 32]}
//               position-y={length / 2}
//             >
//               <meshBasicMaterial attach="material" color={shaftColor} />
//             </Cylinder>
//             <Cone
//               args={[headRadius, headHeight, 32]}
//               position-y={length + headHeight / 2}
//             >
//               <meshBasicMaterial attach="material" color={headColor} />
//             </Cone>
//           </>
//         )}
//       </Merged>
//     </mesh>
//   );
// }

// export function ArrowHelper({position, rotation, direction, origin}) {
//   const arrowRef = useRef();
//
//   const dir = useMemo(() => {
//     const direction = new Vector3(1, 2, 0);
//     direction.normalize();
//     return direction;
//   }, []); // The dependencies array is empty because the vector values are constants
//
//   const origin = useMemo(() => new Vector3(0, 0, 0), []);
//
//   const hex = 0xffff00;
//   const length = 1;
//
//   useHelper(arrowRef, ArrowHelper, dir, origin, length, hex);
//
//   return null; // The helper is added to the scene, so you don't need to render anything
// }
