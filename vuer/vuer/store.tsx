import uuid4 from 'uuid4';
import { EventType } from './interfaces';

export type ReducerType<E extends EventType> = (event: E) => E;
export type HandlerType<E extends EventType> = (event: E) => void;

export type reducersType<E extends EventType> = Record<string, Record<string, ReducerType<E>>>;
export type handlersType<E extends EventType> = Record<string, Record<string, HandlerType<E>>>;

export class Store<E extends EventType> {
  reducers: reducersType<E>;

  subscribers: handlersType<E>;

  constructor() {
    this.reducers = {};
    this.subscribers = {};
  }

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

  publish(event: E): E {
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
