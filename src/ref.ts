import { Ref } from './types';

export const ref =
  <T, M>(resolver: (module: M) => T) =>
  (module: M): Ref<T> => ({
    get current() {
      return resolver(module);
    },
  });
