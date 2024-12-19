import { StackError, StackErrorType } from './StackError.js';

export class Stack<T> {
  constructor(
    public readonly items: T[] = [],
    private readonly set = new Set<T>(),
  ) {}

  push(item: T) {
    if (this.set.has(item)) throw new StackError(StackErrorType.Exists);
    this.items.push(item);
    this.set.add(item);
  }

  pop() {
    const item = this.items.pop();
    if (item == null) throw new StackError(StackErrorType.Empty);
    this.set.delete(item);
    return item;
  }

  peek() {
    return this.items.at(-1);
  }

  toStringArray(): string[] {
    return this.items.map(String);
  }

  get length() {
    return this.items.length;
  }
}
