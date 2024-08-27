// import { useLayoutEffect, useRef } from "react";
//
// export function useStateChange<T extends Inputs>(
//   onChange: (prev: T) => void,
//   inputs: T,
// ) {
//   const previous = useRef(inputs);
//   useLayoutEffect(() => {
//     onChange(previous.current);
//     previous.current = inputs;
//   }, inputs);
// }
