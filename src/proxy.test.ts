import { describe, it, expect } from '@jest/globals';
import { proxy, noop, NoClass } from './proxy';

describe('proxy', () => {
  type Module = {
    center: { x: number; y: number };
  };

  it('allows to operate with single reference by different object', () => {
    const pointA = { x: 0, y: 0 };
    const pointB = { x: 10, y: 10 };

    const module: Module = {
      center: pointA,
    };

    const center = proxy((module: Module) => module.center)(module);

    expect(center).toEqual(pointA);
    module.center = pointB;
    expect(center).toEqual(pointB);
  });

  it('allows to manipulate object properties', () => {
    const point = { x: 0, y: 0 };

    const module: Module = {
      center: point,
    };

    const center = proxy((module: Module) => module.center)(module);

    center.x = 10;
    center.y = 10;

    expect(point).toEqual({ x: 10, y: 10 });
  });

  it('allows to call object methods', () => {
    const point = {
      x: 0,
      y: 0,
      move(x: number, y: number) {
        this.x = x;
        this.y = y;
      },
    };

    const module = {
      center: point,
    };

    const center = proxy(({ center }: typeof module) => center)(module);

    center.move(10, 10);

    expect(point).toEqual({ x: 10, y: 10, move: expect.any(Function) });
  });

  it('allows to delete object properties', () => {
    const point = { x: 0, y: 0 } as { x?: number; y: number };

    const module = {
      center: point,
    };

    const center = proxy(({ center }: typeof module) => center)(module);

    delete center.x;

    expect(point).toEqual({ y: 0 });
  });

  it('allows to get object keys', () => {
    const point = { x: 0, y: 0 };

    const module = {
      center: point,
    };

    const center = proxy(({ center }: typeof module) => center)(module);

    expect(Object.keys(center)).toEqual(['x', 'y']);
  });

  it('allows to get property names', () => {
    const $point = Symbol('point');
    const point = { x: 0, y: 0, [$point]: true };

    const module = {
      center: point,
    };

    const center = proxy(({ center }: typeof module) => center)(module);

    expect(Object.getOwnPropertyNames(center)).toEqual(['x', 'y']);
  });

  it('allows to get property symbols', () => {
    const $point = Symbol('point');
    const point = { x: 0, y: 0, [$point]: true };

    const module = {
      center: point,
    };

    const center = proxy(({ center }: typeof module) => center)(module);

    expect(Object.getOwnPropertySymbols(center)).toEqual([$point]);
  });

  it('allows to check if property exists', () => {
    const point = { x: 0, y: 0 };

    const module = {
      center: point,
    };

    const center = proxy(({ center }: typeof module) => center)(module);

    expect('x' in center).toBe(true);
    expect('z' in center).toBe(false);

    expect(center.hasOwnProperty('x')).toBe(true);
    expect(center.hasOwnProperty('z')).toBe(false);
  });

  it('allows to define property', () => {
    const point = { x: 0, y: 0 };

    const module = {
      center: point,
    };

    const center = proxy(({ center }: typeof module) => center)(module);

    Object.defineProperty(center, 'z', { value: 0 });

    expect((center as any).z).toBe(0);
  });

  it('allows to get property descriptor', () => {
    const point = { x: 0, y: 0 };

    const module = {
      center: point,
    };

    const center = proxy(({ center }: typeof module) => center)(module);

    expect(Object.getOwnPropertyDescriptor(center, 'x')).toEqual({
      configurable: true,
      enumerable: true,
      value: 0,
      writable: true,
    });
  });

  it('allows to invoke target if it is a function', () => {
    const module = {
      multiply: (a: number, b: number) => a * b,
    };

    const calc = proxy.fn(({ multiply }: typeof module) => multiply)(module);

    const result = calc(2, 3);

    expect(result).toBe(6);
  });

  it('allows to construct target if it is a constructor', () => {
    class Point {
      constructor(
        public x: number,
        public y: number,
      ) {}
    }

    const module = {
      Point,
    };

    const PointProxy = proxy.constructor(({ Point }: typeof module) => Point)(
      module,
    );

    const point = new PointProxy(1, 2);

    expect(point).toBeInstanceOf(Point);
    expect(point).toEqual({ x: 1, y: 2 });
  });
});

describe('proxy:noop', () => {
  it('does nothing', () => {
    expect(noop()).toBeUndefined();
  });
});

describe('proxy:NoClass', () => {
  it('is an empty class', () => {
    expect(new NoClass()).toBeInstanceOf(NoClass);
  });
});
