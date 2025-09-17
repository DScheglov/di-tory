import { proxy } from './proxy.js';
import Scope from './scope.js';
import type { Resolver, ScopeType } from './types.js';

const createScopeProxy = <T extends object, M extends object, P extends object>(
  itemResolver: Resolver<M, P, T>,
  scope: ScopeType,
  dummyTarget: T,
): Resolver<M, P, T> => {
  const key = Symbol('di-tory::proxied'); /// always unique

  const proxyResolver = proxy((module: M) => (module as any)[key], dummyTarget);

  const newItemResolver = (injection: M, params: P) =>
    itemResolver(injection, params);

  Object.defineProperties(newItemResolver, {
    name: { value: `${scope}::${itemResolver.name}` },
    scope: { value: scope },
    length: { value: itemResolver.length },
  });

  return Object.defineProperties(proxyResolver, {
    isProxy: { value: true, writable: false },
    key: { value: key, writable: false },
    resolver: { value: newItemResolver, writable: false },
    scope: {
      value: Scope.forced.module,
      writable: false,
    },
  });
};

export const async = <T extends object, M extends object, P extends object>(
  itemResolver: Resolver<M, P, T>,
  dummyTarget: T = {} as T,
): Resolver<M, P, T> =>
  createScopeProxy(itemResolver, `?${Scope.async}`, dummyTarget);

const noop = () => {};

async.fn = <
  T extends (...args: never[]) => unknown,
  M extends object,
  P extends object,
>(
  itemResolver: Resolver<M, P, T>,
): Resolver<M, P, T> => async(itemResolver, noop as T);

export const transient = <T extends object, M extends object, P extends object>(
  itemResolver: Resolver<M, P, T>,
  dummyTarget: T = {} as T,
): Resolver<M, P, T> =>
  createScopeProxy(itemResolver, `?${Scope.transient}`, dummyTarget);

transient.fn = <
  T extends (...args: never[]) => unknown,
  M extends object,
  P extends object,
>(
  itemResolver: Resolver<M, P, T>,
): Resolver<M, P, T> => transient(itemResolver, noop as T);
