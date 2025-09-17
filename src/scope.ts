import type { ScopeMap, Scopes, ScopeType } from './types';

const Scope: ScopeMap = {
  transient: 'transient',
  singleton: 'singleton',
  module: 'module',
  async: 'async',
  forced: {
    module: '!module',
    async: '!async',
  },
};

export const normalizeScope = (scope?: ScopeType): Scopes | undefined => {
  const firstChar = scope?.charAt(0);

  if (firstChar === '?' || firstChar === '!') {
    return scope!.slice(1) as Scopes;
  }

  return scope as Scopes;
};

export const overrideScope = (
  resolverScope?: ScopeType,
  scope?: ScopeType,
): ScopeType | undefined => {
  if (scope === undefined) return resolverScope;

  const normalizedScope = normalizeScope(scope);

  if (resolverScope === undefined) return normalizedScope;

  if (resolverScope.charAt(0) === '!' || scope?.charAt(0) === '?')
    return resolverScope;

  if (resolverScope === Scope.singleton) return resolverScope;

  if (resolverScope === Scope.module)
    return normalizedScope === Scope.async ||
      normalizedScope === Scope.transient
      ? normalizedScope
      : resolverScope;

  if (resolverScope === Scope.async)
    return normalizedScope === Scope.transient
      ? normalizedScope
      : resolverScope;

  return resolverScope;
};

export default Scope;
