import uuid4 from 'uuid4';
import { EventType } from './interfaces';

/**
 * Type definition for a reducer function.
 * @template E - Extends EventType, representing the event type the reducer handles.
 * @type {(event: E) => E} - Function type taking an event of type E and returning an event of type E.
 */
export type ReducerType<E extends EventType> = (event: E) => E;

/**
 * Type definition for a handler function.
 * @template E - Extends EventType, representing the event type the handler deals with.
 * @type {(event: E) => void} - Function type taking an event of type E and returning void.
 */
export type HandlerType<E extends EventType> = (event: E) => void;

/**
 * Type definition for a record of reducers.
 * @template E - Extends EventType, representing the event type the reducers handle.
 * @type {Record<string, Record<string, ReducerType<E>>>} - A record of reducer functions indexed by event type and then by UUID.
 */
export type reducersType<E extends EventType> = Record<
  string,
  Record<string, ReducerType<E>>
>;

/**
 * Type definition for a record of handlers.
 * @template E - Extends EventType, representing the event type the handlers deal with.
 * @type {Record<string, Record<string, HandlerType<E>>>} - A record of handler functions indexed by event type and then by UUID.
 */
export type handlersType<E extends EventType> = Record<
  string,
  Record<string, HandlerType<E>>
>;

/**
 * Represents a store that manages reducers and subscribers for event handling.
 * @template E - Extends EventType, indicating the type of events the store handles.
 */
export class Store<E extends EventType> {
  reducers: reducersType<E>;
  subscribers: handlersType<E>;

  /**
   * Initializes the store with empty reducers and subscribers.
   */
  constructor() {
    this.reducers = {};
    this.subscribers = {};
  }

  /**
   * Adds a reducer function for a specific event type.
   * @param eventType - The type of event the reducer handles.
   * @param reducer - The reducer function to add.
   * @param id - Optional UUID for the reducer. If not provided, a new UUID is generated.
   * @returns A function to remove the added reducer.
   */
  addReducer(eventType: string, reducer: ReducerType<E>, id?: string) {
    const uuid = id || uuid4();
    if (!this.reducers[eventType]) {
      this.reducers[eventType] = {};
    }
    this.reducers[eventType][uuid] = reducer;
    return () => {
      delete this.reducers[eventType][uuid];
    };
  }

  /**
   * Subscribes a handler function for a specific event type.
   * @param eventType - The type of event the handler is interested in.
   * @param handler - The handler function to subscribe.
   * @param id - Optional UUID for the handler. If not provided, a new UUID is generated.
   * @returns A function to remove the subscribed handler.
   */
  subscribe(eventType: string, handler: HandlerType<E>, id?: string) {
    const uuid = id || uuid4();
    if (!this.subscribers[eventType]) {
      this.subscribers[eventType] = {};
    }
    this.subscribers[eventType][uuid] = handler;
    return () => {
      delete this.subscribers[eventType][uuid];
    };
  }

  /**
   * Publishes an event to all reducers and subscribers interested in the event type.
   * @param event - The event to publish.
   * @returns The event after being processed by reducers.
   */
  publish(event: E): E | void {
    if (!event) return;
    const eventType = event.etype;

    const reducers = this.reducers[eventType] || {};
    for (const id in reducers) {
      const reducer = this.reducers[eventType][id];
      event = reducer(event);
    }

    const subs = this.subscribers[eventType] || {};
    for (const id in subs) {
      const handler = this.subscribers[eventType][id];
      setTimeout(() => { handler(event); }, 0);
    }

    const multicast = this.subscribers['*'] || {};
    for (const id in multicast) {
      const handler = multicast[id];
      setTimeout(() => { handler(event); }, 0);
    }
    return event;
  }
}

