import { Store } from './store';
import { EventType } from './interfaces';

/**
 * Represents a fused store that merges the functionalities of two separate stores into one.
 * This class extends the `Store` class, inheriting its basic structure while introducing mechanisms
 * to fuse reducers and subscribers from two distinct stores. It allows for the unified handling
 * of events, ensuring that reducers and subscribers from both original stores are invoked appropriately.
 * Additionally, it provides a method to add new reducers to the fused store, enhancing its flexibility.
 *
 * The Fuse class differs from the Combine class in several key aspects:
 *
 * 1. Reducer and Subscriber Fusion vs. Event Subscription:
 *   - `Fuse` merges the reducers and subscribers from two stores into a single store, allowing for a unified handling of events. It also allows adding new reducers to the fused store.
 *   - `Combine`, on the other hand, subscribes to all events from two stores and re-publishes them to its own subscribers, effectively merging the event streams without altering reducers or subscribers.
 *
 * 2. Flexibility in Handling Events:
 *   - `Fuse` provides more flexibility by allowing the addition of new reducers, making it suitable for scenarios where the event handling logic needs to be extended or customized.
 *   - `Combine` is more focused on simply merging event streams, making it ideal for scenarios where events from multiple sources need to be observed without modification.
 *
 * 3. Use Cases:
 *   - `Fuse` is best used when there is a need to not only merge the functionalities of two stores but also to enhance or modify the event handling logic.
 *   - `Combine` is best suited for scenarios where the primary requirement is to listen to events from multiple sources in a centralized manner.
 *
 * # Usage example for the Fuse class:
 *
 * Assuming `store1` and `store2` are instances of stores that extend the `Store` class,
 * and you want to create a fused store that combines their functionalities and allows for additional reducers:
 *
 * ```typescript
 * const fuseStore = new Fuse(store1, store2);
 *
 * // To add a new reducer to the fused store:
 * fuseStore.addReducer('newReducerKey', (event) => {
 *   console.log('Processing event with new reducer:', event);
 * });
 *
 * // To subscribe to the fused event stream:
 * fuseStore.subscribe('*', (event) => {
 *   console.log('Received an event:', event);
 * });
 *
 * // Assuming `store1` and `store2` publish some events:
 * store1.publish({ type: 'event1', payload: { ... } });
 * store2.publish({ type: 'event2', payload: { ... } });
 *
 * // The console will log the events published by both `store1` and `store2`,
 * // and then process them with the new reducer added to the fused store.
 * ```
 *
 * @template E The event type that the store handles, extending the base `EventType`.
 * @extends Store<E> The base store class that this class extends from.
 */
export class Fuse<E extends EventType> extends Store<E> {
  /**
   * Constructs a new instance of the fused store.
   * This constructor initializes the fused store with empty reducers and subscribers objects.
   * It then fuses the reducers and subscribers from two provided stores (`store_1` and `store_2`)
   * into `this.reducers` and `this.subscribers` respectively. This is achieved by calling the
   * `fuseStores` method for each store's reducers and subscribers, ensuring that the fused
   * store contains all unique reducers and subscribers from both stores without modifying the original
   * stores' objects, adhering to the principle of immutability.
   *
   * @param s1 The first store to be fused.
   * @param s2 The second store to be fused.
   */
  constructor(s1: Store<E>, s2: Store<E>) {
    super();

    // use stores directly into this.reducers and this.subscribers
    this.reducers = this.fuse(this.reducers, s1.reducers);
    this.reducers = this.fuse(this.reducers, s2.reducers);

    this.subscribers = this.fuse(this.subscribers, s1.subscribers);
    this.subscribers = this.fuse(this.subscribers, s2.subscribers);
  }

  /**
   * Fuses the reducers and subscribers from two stores into a single, unified store.
   * This method creates a new object that represents the fused state of reducers and subscribers
   * without modifying the original inputs, adhering to the principle of immutability.
   * It iterates over the entries of the new store (newEntries) and merges them with the existing
   * container. If an entry already exists in the container, it merges the two, otherwise, it simply
   * adds the new entry. This ensures that the fused store has a complete set of reducers and
   * subscribers from both stores, without duplicates.
   *
   * @param container The current state of reducers or subscribers in the fused store.
   * @param newEntries The reducers or subscribers from one of the original stores to be fused.
   * @returns A new object representing the fused state of reducers or subscribers.
   */
  private fuse(container: any, newEntries: any): any {
    const fused = { ...container };

    Object.keys(newEntries).forEach((key) => {
      if (!fused[key]) return (fused[key] = { ...newEntries[key] });
      Object.keys(newEntries[key]).forEach((uuid) => {
        if (!fused[key][uuid])
          return (fused[key][uuid] = newEntries[key][uuid]);
        // Implement custom merge logic here if necessary
        // For example, if the values are arrays, you might want to concatenate them
        // fused[key][uuid] = [...fused[key][uuid], ...newEntries[key][uuid]];
        // For now, we'll simply overwrite, but this can be adjusted as needed
        fused[key][uuid] = newEntries[key][uuid];
      });
    });

    return fused;
  }
}

/**
 * Represents a combined store that integrates events from two separate stores.
 * This class extends the `Store` class and subscribes to all events from both
 * provided stores. Upon receiving an event from either store, it publishes the
 * event to its own subscribers, effectively merging the event streams of the two stores.
 * This allows for centralized handling of events from multiple sources.
 *
 * Usage example:
 * Assuming `store1` and `store2` are instances of stores that extend the `Store` class,
 * and you want to combine their event streams into a single stream that can be subscribed to:
 *
 * ```typescript
 * const combinedStore = new Combine(store1, store2);
 *
 * // To subscribe to the combined event stream:
 * combinedStore.subscribe('*', (event) => {
 *   console.log('Received an event:', event);
 * });
 *
 * // Assuming `store1` and `store2` publish some events:
 * store1.publish({ type: 'event1', payload: { ... } });
 * store2.publish({ type: 'event2', payload: { ... } });
 *
 * // The console will log the events published by both `store1` and `store2`.
 * ```
 *
 * @template E The event type that the store handles, extending the base EventType.
 * @extends Store<e> The base store class that this class extends from. / export class Combine<e> extends Store<e> { /</e></e>*
 * Constructs a new instance of the Combine class, subscribing to all events
 * from the two provided stores and re-publishing them to its own subscribers.
 *
 * @param s1 The first store to subscribe to.
 * @param s2 The second store to subscribe to. / constructor(s1: Store<e>, s2: Store<e>) { super(); s1.subscribe('</e></e>', this.publish); s2.subscribe('*', this.publish); } }
 * </e>
 */
export class Combine<E extends EventType> extends Store<E> {
  /**
   * Constructs a new instance of the Combine class, subscribing to all events
   * from the two provided stores and re-publishing them to its own subscribers.
   * This ensures that any event published by either of the original stores is also
   * published by this combined store, effectively merging the event streams.
   *
   * @param s1 The first store to subscribe to.
   * @param s2 The second store to subscribe to.
   */
  constructor(s1: Store<E>, s2: Store<E>) {
    super();
    // Fix: Pass the event received from the original stores to the publish method.
    s1.subscribe('*', (event) => this.publish(event));
    s2.subscribe('*', (event) => this.publish(event));
  }
}
