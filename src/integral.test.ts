import { describe, it, expect, jest } from '@jest/globals';
import Module from './module-builder';
import Scope from './scope';
import {
  DependencyResolutionError,
  DependencyResolutionErrorCode,
} from './DependencyResolutionError';
import { run, init } from './async-scope';
import asyncScopeApi from './async-scope.node';

init(asyncScopeApi);

describe('Module', () => {
  describe('Module::basics', () => {
    it('creates a module with dependency tree inside', () => {
      const main = Module()
        .private({
          b: () => 1,
        })
        .private({
          a: ({ b }) => b + 1,
        })
        .public({
          c: ({ a }) => a + 1,
        })
        .create();

      expect(main.c).toBe(3);
    });

    it("doesn't calls the resolver twice", () => {
      const b = jest.fn(() => 1);
      const a = jest.fn(({ b }: { b: number }) => b + 1);
      const c = jest.fn(({ a }: { a: number }) => a + 1);

      const main = Module()
        .private({ b })
        .private({ a })
        .public({ c })
        .create();

      expect(main.c).toBe(3);

      expect(b).toHaveBeenCalledTimes(1);
      expect(a).toHaveBeenCalledTimes(1);
      expect(c).toHaveBeenCalledTimes(1);

      main.c;

      expect(b).toHaveBeenCalledTimes(1);
      expect(a).toHaveBeenCalledTimes(1);
      expect(c).toHaveBeenCalledTimes(1);
    });

    it('throws an error when the dependency is not found', () => {
      const main = Module()
        .public({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          a: ({ b }: any) => b + 1,
        })
        .create();

      expect(() => main.a).toThrowError(
        new DependencyResolutionError(
          DependencyResolutionErrorCode.ResolverIsNotDefined,
          ['a'],
          'b',
        ),
      );
    });

    it('throws an error when trying to access the private resolver', () => {
      const main: Partial<Record<string, unknown>> = Module()
        .private({
          a: () => 1,
        })
        .create();

      expect(() => main.a).toThrowError(
        new DependencyResolutionError(
          DependencyResolutionErrorCode.PrivateMemberAccessFailure,
          [],
          'a',
        ),
      );
    });

    it('throws an error when the resolvers throws', () => {
      const main = Module()
        .public({
          a: () => {
            throw new Error('Error');
          },
        })
        .create();

      expect(() => main.a).toThrowError(
        new DependencyResolutionError(
          DependencyResolutionErrorCode.InstantiationFailure,
          [],
          'a',
          new Error('Error'),
        ),
      );
    });

    it('throws an error in case of circular dependency', () => {
      const main = Module()
        .public({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          a: ({ b }: any) => b + 1,
        })
        .public({
          b: ({ a }: { a: number }) => a + 1,
        })
        .create();

      expect(() => main.a).toThrowError(
        new DependencyResolutionError(
          DependencyResolutionErrorCode.CircularDependencyFailure,
          ['a', 'b'],
          'a',
        ),
      );
    });
  });

  describe('Module::cyclic dependencies', () => {
    it('creates a module and allows to resolve cyclic dependencies', () => {
      type Node<T> = {
        value: T;
        child: Node<T> | null;
        parent: Node<T> | null;
      };

      const node = <T>(
        value: T,
        { child, parent }: Partial<Pick<Node<T>, 'child' | 'parent'>> = {},
      ): Node<T> => ({
        value,
        child: child ?? null,
        parent: parent ?? null,
      });

      const main = Module()
        .public({
          parent: () => node(1),
        })
        .public({
          child: ({ parent }) => node(2, { parent }),
        })
        .init({
          parent({ child }) {
            this.child = child;
          },
        })
        .create();

      expect(main.parent.child).toBe(main.child);
      expect(main.child.parent).toBe(main.parent);
    });

    it('throws an error in attempt to extend module after initialization (public)', () => {
      const main = Module()
        .public({
          a: () => 1,
        })
        .init({
          a() {},
        });

      expect(() =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (main as any).public({
          b: () => 2,
        }),
      ).toThrowError('Cannot extend initialized module');
    });

    it('throws an error in attempt to extend module after initialization (private)', () => {
      const main = Module()
        .private({
          a: () => 1,
        })
        .init({
          a() {},
        });

      expect(() =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (main as any).private({
          b: () => 2,
        }),
      ).toThrowError('Cannot extend initialized module');
    });
  });

  describe('Module::implementations', () => {
    it('creates a module with public method', () => {
      const main = Module()
        .publicImpl({
          a: () => 1,
        })
        .create();

      expect(main.a()).toBe(1);
    });

    it('creates a module with public method that has access to the module items', () => {
      const main = Module()
        .private({
          b: () => 1,
        })
        .publicImpl({
          a: ({ b }, x: number) => b + x,
        })
        .create();

      expect(main.a(1)).toBe(2);
    });

    it('creates a module with private method and public method', () => {
      const main = Module()
        .private({
          a: () => 1,
        })
        .privateImpl({
          getA: ({ a }) => a,
          doubleA: ({ a }) => a * 2,
        })
        .publicImpl({
          doubleIfOdd({ doubleA, getA }, x: number) {
            return x % 2 === 1 ? doubleA() : getA();
          },
        })
        .create();

      expect(main.doubleIfOdd(2)).toBe(1);
      expect(main.doubleIfOdd(3)).toBe(2);
    });
  });

  describe('Module::transient-scope', () => {
    it('creates a module with item in transient scope', () => {
      const c = jest.fn(({ a }: { a: number }) => a + 1);
      const main = Module()
        .private({
          b: () => 1,
        })
        .public({
          a: ({ b }) => b + 1,
        })
        .public({ c }, Scope.transient)
        .create();

      expect(main.c).toBe(3);
      expect(c).toHaveBeenCalledTimes(1);

      main.c;
      expect(c).toHaveBeenCalledTimes(2);

      main.c;
      expect(c).toHaveBeenCalledTimes(3);
    });

    it('spreads the transient scope to the dependent items', () => {
      const b = jest.fn(() => 1);
      const a = jest.fn(({ b }: { b: number }) => b + 1);
      const c = jest.fn(({ a }: { a: number }) => a + 1);

      const main = Module()
        .private({ b })
        .private({ a }, Scope.transient)
        .public({ c })
        .create();

      expect(main.c).toBe(3);
      expect(a).toHaveBeenCalledTimes(1);
      expect(b).toHaveBeenCalledTimes(1);
      expect(c).toHaveBeenCalledTimes(1);

      main.c;
      expect(a).toHaveBeenCalledTimes(2);
      expect(b).toHaveBeenCalledTimes(1);
      expect(c).toHaveBeenCalledTimes(2);

      main.c;
      expect(a).toHaveBeenCalledTimes(3);
      expect(b).toHaveBeenCalledTimes(1);
      expect(c).toHaveBeenCalledTimes(3);
    });

    it('spreads the transient scope to the dependent items transitionally', () => {
      const b = jest.fn(() => 1);
      const a = jest.fn(({ b }: { b: number }) => b + 1);
      const c = jest.fn(({ a }: { a: number }) => a + 1);

      const main = Module()
        .private({ b }, Scope.transient)
        .private({ a })
        .public({ c })
        .create();

      expect(main.c).toBe(3);
      expect(a).toHaveBeenCalledTimes(1);
      expect(b).toHaveBeenCalledTimes(1);
      expect(c).toHaveBeenCalledTimes(1);

      main.c;
      expect(a).toHaveBeenCalledTimes(2);
      expect(b).toHaveBeenCalledTimes(2);
      expect(c).toHaveBeenCalledTimes(2);

      main.c;
      expect(a).toHaveBeenCalledTimes(3);
      expect(b).toHaveBeenCalledTimes(3);
      expect(c).toHaveBeenCalledTimes(3);
    });

    it('respects the singleton scope', () => {
      const b = jest.fn(() => 1);
      const a = jest.fn(({ b }: { b: number }) => b + 1);
      const c = jest.fn(({ a }: { a: number }) => a + 1);

      const main = Module()
        .private({ b }, Scope.transient)
        .public({ a })
        .public({ c }, Scope.singleton)
        .create();

      expect(main.c).toBe(3);
      expect(a).toHaveBeenCalledTimes(1);
      expect(b).toHaveBeenCalledTimes(1);
      expect(c).toHaveBeenCalledTimes(1);

      main.c;
      expect(a).toHaveBeenCalledTimes(1);
      expect(b).toHaveBeenCalledTimes(1);
      expect(c).toHaveBeenCalledTimes(1);

      main.a;
      expect(a).toHaveBeenCalledTimes(2);
      expect(b).toHaveBeenCalledTimes(2);
      expect(c).toHaveBeenCalledTimes(1);
    });

    it('resolves the transient item only one time per resolution cycle', () => {
      const b = jest.fn(() => 1);
      const a = jest.fn(({ b }: { b: number }) => b + 1);
      const c = jest.fn(({ a, b }: { a: number; b: number }) => a + b + 1);

      const main = Module()
        .private({ b }, Scope.transient)
        .private({ a })
        .public({ c })
        .create();

      expect(main.c).toBe(4);
      expect(a).toHaveBeenCalledTimes(1);
      expect(b).toHaveBeenCalledTimes(1);
      expect(c).toHaveBeenCalledTimes(1);
    });
  });

  describe('Module::async-scope', () => {
    it('creates a module with item in async scope (works as module scope, if request out of the async context)', async () => {
      let counter = 0;
      const idGenerator = jest.fn(() => ++counter);
      const main = Module()
        .private(
          {
            requestId: idGenerator,
          },
          Scope.async,
        )
        .public({
          currentRequestId: ({ requestId }) => requestId,
        })
        .create();

      const firstRequestId = await Promise.resolve().then(
        () => main.currentRequestId,
      );

      const secondRequestId = await Promise.resolve().then(
        () => main.currentRequestId,
      );

      expect(firstRequestId).toBe(secondRequestId);
      expect(idGenerator).toHaveBeenCalledTimes(1);
    });

    it('creates a module with item in async scope (sequent microtasks)::run', async () => {
      let counter = 0;
      const idGenerator = jest.fn(() => ++counter);
      const main = Module()
        .private(
          {
            requestId: idGenerator,
          },
          Scope.async,
        )
        .public({
          currentRequestId: ({ requestId }) => requestId,
        })
        .create();

      const firstRequestId = await run(() =>
        Promise.resolve().then(() => main.currentRequestId),
      );

      const secondRequestId = await run(() =>
        Promise.resolve().then(() => main.currentRequestId),
      );

      expect(firstRequestId).not.toBe(secondRequestId);
      expect(idGenerator).toHaveBeenCalledTimes(2);
    });

    it('creates a module with item in async scope (parallel microtasks)::run', async () => {
      let counter = 0;
      const idGenerator = jest.fn(() => ++counter);
      const main = Module()
        .private(
          {
            requestId: idGenerator,
          },
          Scope.async,
        )
        .public({
          currentRequestId: ({ requestId }) => requestId,
        })
        .create();

      const p1 = run(() => Promise.resolve().then(() => main.currentRequestId));

      const p2 = run(() => Promise.resolve().then(() => main.currentRequestId));

      const [firstRequestId, secondRequestId] = await Promise.all([p1, p2]);

      expect(firstRequestId).not.toBe(secondRequestId);
      expect(idGenerator).toHaveBeenCalledTimes(2);
    });
  });

  describe('Memoization', () => {
    it("doesn't memoize on the resolver level", () => {
      const factory = ({ x }: { x: number }) => ({ x: x + 1 });
      const main = Module()
        .private({
          x: () => 1,
        })
        .public({
          y: factory,
          z: factory,
        })
        .create();

      expect(main.y).not.toBe(main.z);
    });
  });
});
