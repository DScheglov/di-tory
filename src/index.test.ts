import { describe, expect, it } from '@jest/globals';
import * as index from './index';

describe('index', () => {
  it('is defined', () => {
    expect(index).toBeDefined();
  });

  it('exports Module', () => {
    expect(index.Module).toBeDefined();
  });

  it('exports Scope', () => {
    expect(index.Scope).toBeDefined();
  });
});
