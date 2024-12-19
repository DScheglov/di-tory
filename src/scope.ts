import type { ScopeType } from './types';

const Scope: { [scope in ScopeType]: scope } = {
  transient: 'transient',
  singleton: 'singleton',
  module: 'module',
  async: 'async',
};

export const overrideScope = (resolverScope?: ScopeType, scope?: ScopeType) => {
  if (scope === undefined) return resolverScope;
  if (resolverScope === undefined) return scope;

  if (resolverScope.charAt(0) === '!') return resolverScope;

  if (resolverScope === Scope.singleton) return resolverScope;

  if (resolverScope === Scope.module)
    return scope === Scope.async || scope === Scope.transient
      ? scope
      : resolverScope;

  if (resolverScope === Scope.async)
    return scope === Scope.transient ? scope : resolverScope;

  return resolverScope;
};

export default Scope;
