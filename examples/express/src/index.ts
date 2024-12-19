import { Module, Scope } from 'di-tory';
import * as AsyncDiScope from 'di-tory/async-scope';
import asyncScopeNodeApi from 'di-tory/async-scope/node';
import RequestId from './request-id';
import Logger from './logger';
import UserRepository from './user.repo';
import AuthService from './auth.service';
import createExpressApp from './app.express';

AsyncDiScope.init(asyncScopeNodeApi);

const main = Module()
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
    gerRequestId({ ctx }) {
      return ctx.requestId;
    },
  })
  .private({
    logger: ({ gerRequestId }, { level }: { level: string }) =>
      new Logger(level, gerRequestId),
  })
  .private({
    userRepo: ({ logger }) => new UserRepository(logger),
  })
  .private({
    auth: ({ userRepo, logger }) => new AuthService(userRepo, logger),
  })
  .public({
    app: (self, { port }: { port: number }) => createExpressApp(self, { port }),
  });

main.create({ port: 3000, level: 'debug' }).app.run();
