/**
 *
 * Usage:
 *
 * ```tsx
 * const myEmitter = new EventEmitter();
 *
 * // Register a listener for the 'update' event
 * myEmitter.on('update', data => {
 *   console.log(`An update event was emitted with data: ${data}`);
 * });
 *
 * // Emit the 'update' event with some data
 * myEmitter.emit('update', 'This is the emitted data.');
 *
 * // Remove the listener
 * myEmitter.off('update', listener);
 * ```
 */
export interface Listeners {
  [event: string]: ((data?: any) => void)[];
}

export class EventEmitter {
  private listeners: Listeners;

  constructor() {
    this.listeners = {};
  }

  // Register an event listener
  on(event: string, listener: (data?: any) => void): () => void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(listener);

    // Return a function that removes the listener
    return () => {
      this.off(event, listener);
    };
  }

  // Remove an event listener
  off(event: string, listenerToRemove: (data?: any) => void): void {
    if (!this.listeners[event]) {
      return;
    }
    this.listeners[event] = this.listeners[event].filter(
      (listener) => listener !== listenerToRemove,
    );
  }

  // Emit an event to all registered listeners
  emit(event: string, data?: any): void {
    if (!this.listeners[event]) {
      return;
    }
    this.listeners[event].forEach((listener) => listener(data));
  }
}
