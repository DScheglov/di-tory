import { describe, it, expect } from '@jest/globals';
import * as ScopeProxy from './scope-proxy';
import Module from './module-builder';
import { run, init } from './async-scope';
import asyncScopeApi from './async-scope.node';

init(asyncScopeApi);

describe('ScopeProxy', () => {
  it('allows to define resolver with an async scope', () => {
    const main = Module()
      .public({
        requestId: ScopeProxy.async(() => ({
          requestId: Math.random().toFixed(20).slice(2),
          get() {
            return this.requestId;
          },
          set(requestId: string) {
            this.requestId = requestId;
          },
        })),
      })
      .create();

    expect(main.requestId.get()).toMatch(/^\d{20}$/);
  });

  it('allows to use the same instance in the same async scope', async () => {
    expect.assertions(1);
    const main = Module()
      .public({
        requestId: ScopeProxy.async(() => ({
          requestId: Math.random().toFixed(20).slice(2),
          get() {
            return this.requestId;
          },
          set(requestId: string) {
            this.requestId = requestId;
          },
        })),
      })
      .create();

    const [r1, r2] = await run(async () => [
      main.requestId.get(),
      main.requestId.get(),
    ]);

    expect(r1).toBe(r2);
  });

  it('allows to use different instances in different async scopes (seq)', async () => {
    expect.assertions(1);
    const main = Module()
      .public({
        requestId: ScopeProxy.async(() => ({
          requestId: Math.random().toFixed(20).slice(2),
          get() {
            return this.requestId;
          },
          set(requestId: string) {
            this.requestId = requestId;
          },
        })),
      })
      .create();

    const r1 = await run(async () => main.requestId.get());
    const r2 = await run(async () => main.requestId.get());

    expect(r1).not.toBe(r2);
  });

  it('allows to use different instances in different async scopes (parallel)', async () => {
    expect.assertions(1);
    const main = Module()
      .public({
        requestId: ScopeProxy.async(() => ({
          requestId: Math.random().toFixed(20).slice(2),
          get() {
            return this.requestId;
          },
          set(requestId: string) {
            this.requestId = requestId;
          },
        })),
      })
      .create();

    const [r1, r2] = await Promise.all([
      run(async () => main.requestId.get()),
      run(async () => main.requestId.get()),
    ]);

    expect(r1).not.toBe(r2);
  });
});
