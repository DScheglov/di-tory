export const ref =
  <T, M>(resolver: (module: M) => T) =>
  (module: M) =>
  () =>
    resolver(module);
