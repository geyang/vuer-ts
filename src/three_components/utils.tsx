
const identity = (x: number): number => x;

/**
 * Parse a string into an array of numbers
 *
 * @param str - the string to parse
 * @param fn - the function to apply to each element of the array. Used to convert rad => deg.
 */
export function parseArray(str?: string, fn = identity): number[] | void {
  if (!str) return;
  return str.split(',').map(parseFloat).map(fn);
}
