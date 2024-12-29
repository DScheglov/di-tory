import { describe, it, expect } from '@jest/globals';
import { proxy, ref } from './proxy-tools.js';

describe('proxy-tools', () => {
  it('exports ref', () => {
    expect(ref).toBeDefined();
  });

  it('exports proxy', () => {
    expect(proxy).toBeDefined();
  });
});
