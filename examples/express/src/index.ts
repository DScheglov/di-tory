import { Module, Scope } from 'di-tory';
import asyncDiScope from 'di-tory/async-scope';
import asyncScopeNodeApi from 'di-tory/async-scope/node';
import RequestId from './RequestId';
import Logger from './Logger';
import UserRepository from './UserRepository';
import AuthService from './AuthService';
import createExpressApp from './ExpressApp';

asyncDiScope.init(asyncScopeNodeApi);

const App = Module()
  .private(
    {
      asyncRequestId: () => new RequestId(),
    },
    Scope.async,
  )
  .privateImpl({
    setRequestId({ asyncRequestId }, requestId?: string) {
      asyncRequestId.requestId = requestId;
    },
    getRequestId({ asyncRequestId }) {
      return asyncRequestId.requestId;
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
    app: ({ setRequestId, auth, logger }, { port }: { port: number }) =>
      createExpressApp(setRequestId, auth, logger, port),
  })
  .public({
    run: ({ app }) => app.run,
  });

const app = App.create({ port: 3000, level: 'debug' });
app.run();
