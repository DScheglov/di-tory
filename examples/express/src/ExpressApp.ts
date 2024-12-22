import express from 'express';
import asyncDiScope from 'di-tory/async-scope';
import type { IAuthService, IInfoLogger } from './interfaces';

export default function createExpressApp(
  setRequestId: (requestId: string | undefined) => void,
  auth: IAuthService,
  logger: IInfoLogger,
  port: number,
) {
  const app = express();
  const parseJson = express.json();

  app.use((req, res, next) => {
    asyncDiScope.run(() => next());
  });

  app.use((req, res, next) => {
    setRequestId(req.header('X-Request-Id'));
    next();
  });

  app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url} - Request`);
    const _end = res.end;
    res.end = function (...args: any[]) {
      logger.info(`${req.method} ${req.url} - ${res.statusCode}`);
      _end.apply(res, args as any);
    } as any;
    next();
  });

  app.use((req, res, next) =>
    parseJson(req, res, (error) =>
      error instanceof SyntaxError && /json/i.test(error.message)
        ? res.status(400).json({ ok: false, error: 'invalid-json' })
        : next(error),
    ),
  );

  app.post('/login', async (req, res, next) => {
    const { userName, password } = (req.body ?? {}) as Record<string, unknown>;

    if (typeof userName !== 'string' || typeof password !== 'string') {
      res.status(400).json({ ok: false, error: 'invalid-input' });
      return;
    }

    try {
      const result = await auth.authenticate(userName, password);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  });

  // express error handler - suppress eslint error
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((error: any, req: any, res: any, next: any) => {
    console.error(error);

    res.status(500).json({ ok: false, error: 'something-went-wrong' });
  });

  return {
    run() {
      app.listen(port, () => {
        logger.info(`Server running on port ${port}`);
      });
    },
  };
}
