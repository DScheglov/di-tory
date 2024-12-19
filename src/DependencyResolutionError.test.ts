import { describe, it, expect } from '@jest/globals';
import {
  DependencyResolutionError,
  DependencyResolutionErrorCode,
} from './DependencyResolutionError';

describe('DependencyResolutionError', () => {
  it('creates an instance with the correct error code', () => {
    const error = new DependencyResolutionError(
      DependencyResolutionErrorCode.PrivateMemberAccessFailure,
      [],
      'a',
    );

    expect(error.code).toBe(
      DependencyResolutionErrorCode.PrivateMemberAccessFailure,
    );
  });

  it('creates an instance with the correct resolution stack', () => {
    const resolutionStack = ['b', 'c', 'd'];
    const error = new DependencyResolutionError(
      DependencyResolutionErrorCode.CircularDependencyFailure,
      resolutionStack,
      'a',
    );

    expect(error.resolutionStack).toEqual(resolutionStack);
  });

  it('creates an instance with the correct item', () => {
    const error = new DependencyResolutionError(
      DependencyResolutionErrorCode.ResolverIsNotDefined,
      [],
      'b',
    );

    expect(error.item).toBe('b');
  });

  it('creates an instance with the correct cause', () => {
    const cause = new Error('Some error');
    const error = new DependencyResolutionError(
      DependencyResolutionErrorCode.InstantiationFailure,
      [],
      'a',
      cause,
    );

    expect(error.cause).toBe(cause);
  });

  it('creates an instance with the correct error message', () => {
    const resolutionStack = ['b', 'c', 'd'];
    const error = new DependencyResolutionError(
      DependencyResolutionErrorCode.CircularDependencyFailure,
      resolutionStack,
      'a',
    );

    const expectedMessage = `CircularDependencyFailure in attempting to resolve <a> with stack <b> <- <c> <- <d>`;
    expect(error.message).toBe(expectedMessage);
  });
});
