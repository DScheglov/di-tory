import type { NextFunction, Request, Response } from 'express';

export type MaybeAsync<T> = T | Promise<T>;

export interface ExpressHooks {
  onRequest?(req: Request): MaybeAsync<void>;
  onResponse?(req: Request, res: Response, duration: number): MaybeAsync<void>;
};

const hooks =
  ({ onRequest, onResponse }: ExpressHooks) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const onRequestResult = onRequest?.(req);

    if (typeof onRequestResult?.then === 'function') await onRequestResult;

    if (typeof onResponse !== 'function') {
      next();
      return;
    }

    const start = performance.now();

    const _end = res.end;
    res.end = (async (...args: any[]) => {
      const onResponseResult = onResponse(req, res, performance.now() - start);
      if (typeof onResponseResult?.then === 'function') await onResponseResult;
      _end.apply(res, args as any);
    }) as any;

    next();
  };

export default hooks;
