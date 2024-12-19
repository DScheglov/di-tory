export const propertyKeys = <T extends object>(obj: T): (keyof T)[] =>
  [
    ...Object.getOwnPropertyNames(obj),
    ...Object.getOwnPropertySymbols(obj),
  ] as (keyof T)[];

export const mergeObjects = <T extends object, U extends object>(
  tObj: T,
  uObj: U,
): {
  // prettier-ignore
  [K in keyof T | keyof U]: K extends keyof U ? U[K]
  : K extends keyof T ? T[K]
  : never;
} => {
  const tObJDescriptors = Object.getOwnPropertyDescriptors(tObj);
  const uObJDescriptors = Object.getOwnPropertyDescriptors(uObj);

  return Object.defineProperties(Object.create(null), {
    ...tObJDescriptors,
    ...uObJDescriptors,
  });
};
