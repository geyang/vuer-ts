// Dependencies
import { isNothing, Nothing } from 'nothing-mock';

// Directly check and export global objects
export const window = typeof globalThis.window !== 'undefined' ? globalThis.window : Nothing;
export const document = typeof window.document !== 'undefined' ? window.document : Nothing;
export const navigator = typeof window.navigator !== 'undefined' ? window.navigator : Nothing;
export const exists = (variable) => !isNothing(variable);
