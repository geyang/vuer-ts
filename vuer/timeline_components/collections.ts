/**
 * A double-ended queue.
 *
 *
 * Example usage:
 *
 *  ```typescript
 *  const d = new Deque<number>(3);
 *  for (let i = 1; i <= 6; i++) {
 *    d.push(i);
 *    console.log(d.toArray());
 *  }
 * ```
 */
class Deque<T> {
  private buffer: (T | undefined)[];
  public maxlen: number;
  private head: number;
  private tail: number;
  public size: number;

  constructor(array?: T[], maxlen?: number) {
    this.buffer = new Array(maxlen);
    this.maxlen = maxlen;
    this.head = 0;
    this.tail = 0;
    this.size = 0;

    if (array?.length) array.forEach((item) => this.push(item))

  }

  get(index: number, d?: T): T | undefined {
    if (index < 0 || index >= this.size) {
      return d;
    }
    return this.buffer[(this.head + index) % this.maxlen];
  }

  push(item: T): void {
    if (this.size === this.maxlen) {
      this.head = (this.head + 1) % this.maxlen;
    } else {
      this.size++;
    }
    this.buffer[this.tail] = item;
    this.tail = (this.tail + 1) % this.maxlen;
  }

  prepend(item: T): void {
    if (this.size === this.maxlen) {
      this.tail = (this.tail - 1 + this.maxlen) % this.maxlen;
    } else {
      this.size++;
    }
    this.head = (this.head - 1 + this.maxlen) % this.maxlen;
    this.buffer[this.head] = item;
  }

  toArray(): T[] {
    const result: T[] = [];
    for (let i = 0; i < this.size; i++) {
      result.push(this.buffer[(this.head + i) % this.maxlen] as T);
    }
    return result;
  }

  clear(): void {
    this.buffer = new Array(this.maxlen);
    this.size = 0
    this.head = 0
    this.tail = 0
  }
}


export { Deque };