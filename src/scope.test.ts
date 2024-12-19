import { describe, it, expect } from '@jest/globals';
import Scope, { overrideScope } from './scope';

describe('overrideScope', () => {
  it('returns resolverScope if scope is undefined', () => {
    const resolverScope = Scope.singleton;
    const scope = undefined;

    const result = overrideScope(resolverScope, scope);

    expect(result).toBe(resolverScope);
  });

  it('returns scope if resolverScope is undefined', () => {
    const resolverScope = undefined;
    const scope = Scope.transient;

    const result = overrideScope(resolverScope, scope);

    expect(result).toBe(scope);
  });

  it('returns resolverScope if resolverScope is Scope.singleton', () => {
    const resolverScope = Scope.singleton;
    const scope = Scope.transient;

    const result = overrideScope(resolverScope, scope);

    expect(result).toBe(resolverScope);
  });

  it('returns scope if resolverScope is Scope.module and scope is Scope.async', () => {
    const resolverScope = Scope.module;
    const scope = Scope.async;

    const result = overrideScope(resolverScope, scope);

    expect(result).toBe(scope);
  });

  it('returns scope if resolverScope is Scope.module and scope is Scope.transient', () => {
    const resolverScope = Scope.module;
    const scope = Scope.transient;

    const result = overrideScope(resolverScope, scope);

    expect(result).toBe(scope);
  });

  it('returns resolverScope if resolverScope is Scope.module and scope is not Scope.async or Scope.transient', () => {
    const resolverScope = Scope.module;
    const scope = Scope.singleton;

    const result = overrideScope(resolverScope, scope);

    expect(result).toBe(resolverScope);
  });

  it('returns scope if resolverScope is Scope.async and scope is Scope.transient', () => {
    const resolverScope = Scope.async;
    const scope = Scope.transient;

    const result = overrideScope(resolverScope, scope);

    expect(result).toBe(scope);
  });

  it('returns resolverScope if resolverScope is Scope.async and scope is not Scope.transient', () => {
    const resolverScope = Scope.async;
    const scope = Scope.singleton;

    const result = overrideScope(resolverScope, scope);

    expect(result).toBe(resolverScope);
  });

  it('returns resolverScope for any other combination of resolverScope and scope', () => {
    const resolverScope = Scope.transient;
    const scope = Scope.singleton;

    const result = overrideScope(resolverScope, scope);

    expect(result).toBe(resolverScope);
  });
});
