const createProxy =
  <T extends object, M extends object>(
    resolver: (module: M) => T,
    dummyTarget: T,
  ) =>
  (module: M): T =>
    new Proxy(dummyTarget, {
      get: (_, prop) => {
        const target = resolver(module);
        const value = target[prop as keyof T];
        return typeof value === 'function' ? value.bind(target) : value;
      },

      set: (_, prop, value) => {
        const target = resolver(module);
        target[prop as keyof T] = value;
        return true;
      },

      deleteProperty: (_, prop) => {
        const target = resolver(module);
        delete target[prop as keyof T];
        return true;
      },

      has: (_, prop) =>
        Object.prototype.hasOwnProperty.call(resolver(module), prop),

      ownKeys: () => {
        const target = resolver(module);
        return [
          ...Object.getOwnPropertyNames(target),
          ...Object.getOwnPropertySymbols(target),
        ];
      },

      getOwnPropertyDescriptor: (_, prop) =>
        Object.getOwnPropertyDescriptor(resolver(module), prop),

      defineProperty: (_, prop, descriptor) => {
        Object.defineProperty(resolver(module), prop, descriptor);
        return true;
      },

      apply: (_, thisArg, args) => {
        const target = resolver(module) as any;

        return target.apply(thisArg, args);
      },

      construct: (_, args) => {
        const target = resolver(module) as any;

        return new target(...args);
      },
    });

export const noop = () => {};
export class NoClass {}

export const proxy = <T extends { [key in never]: unknown }, M extends object>(
  resolver: (module: M) => T,
  dummyTarget: T = {} as T,
) => createProxy(resolver, dummyTarget);

proxy.fn = <T extends (...args: never[]) => unknown, M extends object>(
  resolver: (module: M) => T,
) => proxy(resolver, noop as T);

proxy.constructor = <
  T extends new (...args: never[]) => unknown,
  M extends object,
>(
  resolver: (module: M) => T,
) => proxy(resolver, NoClass as T);
