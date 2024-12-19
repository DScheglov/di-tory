import { propertyKeys } from './objects.js';
import Scope from './scope.js';
import type { MethodsOf, Resolver, ScopeType, SomeImpl } from './types';

export const decorateResolver = <
  M extends object,
  Params extends object,
  R,
  S extends ScopeType,
>(
  resolver: Resolver<M, Params, R>,
  scope: S,
): Resolver<M, Params, R> => {
  const newResolver = (injection: M, params: Params): R =>
    resolver(injection, params);
  newResolver.scope = scope;
  Object.defineProperty(newResolver, 'name', {
    value: `${scope}::${resolver.name}`,
  });
  return newResolver;
};

export const decorateResolvers = <
  Items extends object,
  M extends object,
  Params extends object,
>(
  resolvers: { [Item in keyof Items]: Resolver<M, Params, Items[Item]> },
  scope: ScopeType,
): { [Item in keyof Items]: Resolver<M, Params, Items[Item]> } => {
  const newResolvers = {} as {
    [Item in keyof Items]: Resolver<M, Params, Items[Item]>;
  };
  for (const key of propertyKeys(resolvers)) {
    newResolvers[key] = decorateResolver(resolvers[key], scope);
  }
  return newResolvers;
};

const createMethodResolver =
  <Impl extends SomeImpl<M>, M extends object, K extends keyof Impl>(
    method: Impl[K],
  ) =>
  (self: M) =>
  (...args: never[]) =>
    method(self, ...args);

export const createMethodResolvers = <
  Impl extends SomeImpl<M>,
  M extends object,
  P extends object,
>(
  implementation: Impl,
): {
  [key in keyof Impl]: Resolver<M, P, MethodsOf<Impl, M>[key]>;
} => {
  const newImplementation = {} as {
    [key in keyof Impl]: Resolver<M, P, MethodsOf<Impl, M>[key]>;
  };

  for (const key of propertyKeys(implementation)) {
    const method = implementation[key];
    if (typeof method !== 'function') {
      throw new Error(
        `Expected ${String(key)} to be a function, but got ${typeof method}`,
      );
    }
    newImplementation[key] = createMethodResolver<Impl, M, typeof key>(
      method,
    ) as any; // eslint-disable-line @typescript-eslint/no-explicit-any
    newImplementation[key].scope = `!${Scope.module}` as ScopeType;
  }

  return newImplementation;
};
