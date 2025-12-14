import { describe, expect, it } from '@jest/globals';
import { Stack } from './Stack.js';
import { StackError } from './StackError.js';

describe('Stack', () => {
  it('pushes, peeks, and pops in LIFO order', () => {
    const stack = new Stack<number>();
    stack.push(1);
    stack.push(2);

    expect(stack.peek()).toBe(2);
    expect(stack.pop()).toBe(2);
    expect(stack.pop()).toBe(1);
    expect(stack.length).toBe(0);
  });

  it('produces a string array of items in order', () => {
    const stack = new Stack<string>();
    stack.push('a');
    stack.push('b');
    stack.push('c');

    expect(stack.toStringArray()).toEqual(['a', 'b', 'c']);
  });

  it('throws when popping an empty stack', () => {
    const stack = new Stack<number>();
    expect(() => stack.pop()).toThrow(StackError);
    expect(() => stack.pop()).toThrow(StackError.Empty);
    expect(() => stack.pop()).toThrow('Stack is empty');
  });

  it('prevents pushing duplicate items', () => {
    const stack = new Stack<number>();
    stack.push(1);
    expect(() => stack.push(1)).toThrow(StackError.Exists);
    expect(() => stack.push(1)).toThrow('Item already exists in stack');
  });
});
