import { describe, it, expect } from '@jest/globals';
import { propertyKeys, mergeObjects } from './objects';

describe('objects', () => {
  describe('propertyKeys', () => {
    it('returns an array of property keys', () => {
      const obj = { a: 1, b: 2, c: 3 };
      const keys = propertyKeys(obj);
      expect(keys).toEqual(['a', 'b', 'c']);
    });

    it('includes symbol property keys', () => {
      const symbolKey = Symbol('key');
      const obj = { a: 1, [symbolKey]: 2 };
      const keys = propertyKeys(obj);
      expect(keys).toEqual(['a', symbolKey]);
    });
  });

  describe('mergeObjects', () => {
    it('merges two objects', () => {
      const tObj = { a: 1, b: 2 };
      const uObj = { c: 3, d: 4 };
      const merged = mergeObjects(tObj, uObj);
      expect(merged).toEqual({ a: 1, b: 2, c: 3, d: 4 });
    });

    it('prioritizes properties from uObj', () => {
      const tObj = { a: 1, b: 2 };
      const uObj = { b: 3, c: 4 };
      const merged = mergeObjects(tObj, uObj);
      expect(merged).toEqual({ a: 1, b: 3, c: 4 });
    });

    it('handles symbol properties', () => {
      const symbolKey = Symbol('key');
      const tObj = { a: 1, [symbolKey]: 'a' };
      const uObj = { [symbolKey]: 3 as const, c: 4 };
      const merged = mergeObjects(tObj, uObj);
      expect(merged).toEqual({ a: 1, [symbolKey]: 3, c: 4 });
    });
  });
});
