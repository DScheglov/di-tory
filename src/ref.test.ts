import { describe, it, expect, jest } from '@jest/globals';
import { ref } from './ref';

describe('ref', () => {
  it('returns a Ref object with a current property', () => {
    const resolver = (module: number) => module * 2;
    const module = 5;
    const result = ref(resolver)(module);

    expect(result()).toBe(10);
  });

  it('calls the resolver function with the module', () => {
    const resolver = jest.fn((module: number) => module * 2);
    const module = 5;
    const result = ref(resolver)(module);

    expect(result()).toBe(10);
    expect(resolver).toHaveBeenCalledWith(module);
  });

  it('works with different types', () => {
    const resolver = (module: string) => module.toUpperCase();
    const module = 'hello';
    const result = ref(resolver)(module);

    expect(result()).toBe('HELLO');
  });

  it('changes the current value when the module changes', () => {
    const module = { value: 5 };
    const resolver = jest.fn((module: { value: number }) => module.value);

    const result = ref(resolver)(module);
    expect(result()).toBe(5);

    module.value = 10;

    expect(result()).toBe(10);
  });
});
