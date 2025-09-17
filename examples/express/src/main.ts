import { Module, ScopeProxy } from 'di-tory';
import asyncDiScope from 'di-tory/async-scope';
import asyncScopeNodeApi from 'di-tory/async-scope/node';
import RequestId from './RequestId';
import Logger from './Logger';
import UserRepository from './UserRepository';
import AuthService from './AuthService';

asyncDiScope.init(asyncScopeNodeApi);

const Main = Module()
  .private({
    requestId: ScopeProxy.async(() => new RequestId()),
  })
  .public({
    logger: ({ requestId }, { level }: { level: string }) =>
      new Logger(level, requestId),
  })
  .private({
    userRepo: ({ logger }) => new UserRepository(logger),
  })
  .private({
    auth: ({ userRepo, logger }) => new AuthService(userRepo, logger),
  })
  .publicImpl({
    setRequestId({ requestId }, rid?: string) {
      requestId.set(rid);
    },
    signIn({ auth }, userName: string, password: string) {
      return auth.authenticate(userName, password);
    },
  });

const main = Main.create({ level: 'debug' });

export default main;
