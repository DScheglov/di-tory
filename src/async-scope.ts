import { AsyncScopeApi, AsyncStorage } from './types';

const diAsyncStore = new WeakMap<AsyncStorage>();

let asyncScopeApi: AsyncScopeApi = {
  enter() {},
  run: <T>(fn: () => T) => fn(),
  getStore: () => diAsyncStore,
  exit() {},
};

export const init = (api: AsyncScopeApi) => {
  asyncScopeApi = api;
  asyncScopeApi.enter();
};

export const enter = () => asyncScopeApi.enter();

export const run = <T>(fn: () => T) => asyncScopeApi.run(fn);

export const getStore = () => asyncScopeApi.getStore();

export const exit = () => asyncScopeApi.exit();
