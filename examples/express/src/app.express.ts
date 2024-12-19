import express from 'express';
import { run } from 'di-tory/async-scope';
import { IAuthService, IInfoLogger } from './interfaces';

export type Dependencies = {
  setRequestId(requestId?: string): void;
  auth: IAuthService;
  logger: IInfoLogger;
};

export type Config = {
  port: number;
};

export default function createExpressApp(
  { auth, setRequestId, logger }: Dependencies,
  { port }: Config,
) {
  const app = express();

  app.use((req, res, next) => {
    run(() => next());
  });

  app.use((req, res, next) => {
    const requestId = req.header('X-Request-Id');
    setRequestId(requestId);
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

  app.use(express.json());

  app.post('/login', async (req, res, next) => {
    const { userName, password } = req.body;

    try {
      const result = await auth.authenticate(userName, password);
      res.status(result.ok ? 200 : 401).json(result);
    } catch (error) {
      next(error);
    }
  });

  return {
    run() {
      app.listen(port, () => {
        logger.info(`Server running on port ${port}`);
      });
    },
  };
}
