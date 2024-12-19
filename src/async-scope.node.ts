import { AsyncLocalStorage } from 'async_hooks';
import { AsyncStorage } from './types';

const diAsyncStorage = new AsyncLocalStorage<AsyncStorage>();

const enter = () => {
  diAsyncStorage.enterWith(new WeakMap());
};

const run = <T>(fn: () => T): T => {
  return diAsyncStorage.run(new WeakMap(), fn);
};

const getStore = () => diAsyncStorage.getStore() ?? new WeakMap();

const exit = () => {
  diAsyncStorage.exit(() => {});
};

export default {
  enter,
  run,
  getStore,
  exit,
};
