# di-tory [![Coverage Status](https://coveralls.io/repos/github/DScheglov/di-tory/badge.svg?branch=main)](https://coveralls.io/github/DScheglov/di-tory?branch=main) [![npm version](https://img.shields.io/npm/v/di-tory.svg?style=flat-square)](https://www.npmjs.com/package/di-tory) [![npm downloads](https://img.shields.io/npm/dm/di-tory.svg?style=flat-square)](https://www.npmjs.com/package/di-tory) [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/DScheglov/di-tory/blob/master/LICENSE)

**di-tory** is a lightweight dependency injection library for TypeScript.

## Installation

```ts
npm install di-tory
```

## Documentation

See the [GitHub Wiki](./docs/README.md) for full documentation.

## Example Usage

Below is a simple usage example.

### Getting Started

All example files [examples/getting-started](examples/getting-started).

```ts
import { Module } from 'di-tory';
import { Logger } from './Logger';
import { UserRepository } from './UserRepository';
import { AuthService } from './AuthService';
import { signIn } from './signInUseCase';

const App = Module()
  .private({
    logger: (_, { logLevel }: { logLevel: string }) => new Logger(logLevel),
  })
  .private({
    userRepository: () => new UserRepository(),
  })
  .private({
    authService: ({ userRepository }) => new AuthService(userRepository),
  })
  .publicImpl({
    signIn,
  });

async function main() {
  const app = App.create({ logLevel: 'debug' });
  const user = await app.signIn('user', 'password');

  console.log(user);
}

main().catch(console.error);
```

### Using With Express

All example files [examples/express](examples/express).

### [src/index.ts](examples/express/src/index.ts) - Composition Root

```ts
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
```

### [src/ExpressApp.ts](examples/express/src/ExpressApp.ts) - Express App

```ts
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

  app.use((req, res, next) => {
    asyncDiScope.run(() => next());
  });

  app.use((req, res, next) => {
    setRequestId(req.header('X-Request-Id'));
    next();
  });

  // -- snip --

  app.use(express.json());

  app.post('/login', async (req, res, next) => {
    const { userName, password } = req.body;

    // -- snip --

    try {
      const result = await auth.authenticate(userName, password);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  });

  // -- snip --

  return {
    run() {
      app.listen(port, () => {
        logger.info(`Server running on port ${port}`);
      });
    },
  };
}
```
