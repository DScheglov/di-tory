import { describe, expect, it, jest } from '@jest/globals';
import asyncScopeApi from './async-scope';

describe('AsyncScopeApi', () => {
  it('uses default implementation', () => {
    jest.spyOn(asyncScopeApi, 'enter');
    jest.spyOn(asyncScopeApi, 'run');
    jest.spyOn(asyncScopeApi, 'getStore');
    jest.spyOn(asyncScopeApi, 'exit');

    asyncScopeApi.enter();
    asyncScopeApi.run(() => {});
    asyncScopeApi.getStore();
    asyncScopeApi.exit();

    expect(asyncScopeApi.enter).toHaveBeenCalled();
    expect(asyncScopeApi.run).toHaveBeenCalled();
    expect(asyncScopeApi.getStore).toHaveBeenCalled();
    expect(asyncScopeApi.exit).toHaveBeenCalled();
  });
});
