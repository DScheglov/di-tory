import { Module, Scope } from 'di-tory';
import AsyncDiScope from 'di-tory/async-scope';
import asyncScopeNodeApi from 'di-tory/async-scope/node';
import RequestId from './request-id';
import Logger from './logger';
import UserRepository from './user.repo';
import AuthService from './auth.service';
import createExpressApp from './app.express';

AsyncDiScope.init(asyncScopeNodeApi);

const App = Module()
  .private(
    {
      ctx: () => new RequestId(),
    },
    Scope.async,
  )
  .privateImpl({
    setRequestId({ ctx }, requestId?: string) {
      ctx.requestId = requestId;
    },
    getRequestId({ ctx }) {
      return ctx.requestId;
    },
  })
  .private({
    logger: ({ getRequestId }, { level }: { level: string }) =>
      new Logger(level, getRequestId),
  })
  .private({
    userRepo: ({ logger }) => new UserRepository(logger),
  })
  .private({
    auth: ({ userRepo, logger }) => new AuthService(userRepo, logger),
  })
  .private({
    app: (self, { port }: { port: number }) => createExpressApp(self, { port }),
  })
  .public({
    run: ({ app }) => app.run,
  });

const app = App.create({ port: 3000, level: 'debug' });
app.run();
