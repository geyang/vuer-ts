import { Float16Array } from '@petamoriken/float16';

export function half2float(halfArray: Uint16Array): Float32Array {
  const arr = new Float16Array(
    halfArray.buffer.slice(halfArray.byteOffset),
    0,
    halfArray.length / 2,
  );
  const dump: number[] = [];
  arr.forEach((c) => dump.push(c));
  return new Float32Array(dump);
}

export function uint162float(uint16Array: Uint16Array): Float32Array {
  const arr = new Uint16Array(
    uint16Array.buffer.slice(uint16Array.byteOffset),
    0,
    uint16Array.length / 2,
  );
  const dump: number[] = [];
  arr.forEach((c) => dump.push(c));
  return new Float32Array(dump);
}
