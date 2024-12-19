# DI-TORY

**di-tory** is a lightweight dependency injection library for TypeScript.
It provides a flexible and type-safe way to configure and instantiate application
modules with clearly defined dependencies, all while keeping code organized
and maintainable.

With **di-tory**, you can easily define modules, manage lifecycles, and inject
parameters at runtime, ensuring that your application components remain decoupled
and testable.

## 1. Installation

```ts
npm install di-tory
```

## 2. Example Usage

Below is a simple usage example. Notice how the `Module` function lets you define private and public dependencies and then create instances with runtime parameters.

```ts
import { Module } from 'di-tory';

interface IInfoLogger {
  info(message: string): void;
}

type User = {
  id: string;
  name: string;
  passwordHash: string;
};

interface IUserRepository {
  getUser(userName: string): Promise<User>;
}

interface IAuthService {
  authenticate(userName: string, password: string): Promise<User>;
}

class Logger implements IInfoLogger {
  constructor(public level: string) {}
  info(message: string) {
    if (this.level !== 'debug') return;
    console.log(message);
  }
}

class UserRepository implements IUserRepository {
  async getUser(userName: string) {
    return {
      id: '1',
      name: userName,
      passwordHash: 'password',
    };
  }
}

class AuthService implements IAuthService {
  constructor(private userRepo: IUserRepository) {}

  async authenticate(userName: string, password: string) {
    const user = await this.userRepo.getUser(userName);

    if (user.passwordHash !== password) {
      throw new Error('Invalid password');
    }

    return user;
  }
}

type SignInDependencies = {
  logger: IInfoLogger;
  authService: Pick<IAuthService, 'authenticate'>;
};

function signIn(
  { authService, logger }: SignInDependencies,
  userName: string,
  password: string,
) {
  logger.info(`Authenticating user: ${userName}`);
  return authService.authenticate(userName, password);
}

const app = Module()
  .private({
    logger: (_, { logLevel }: { logLevel: string }) => new Logger(logLevel),
    userRepository: () => new UserRepository(),
  })
  .private({
    authService: ({ userRepository }) => new AuthService(userRepository),
  })
  .publicImpl({
    signIn, //
  });

async function main() {
  const { signIn } = app.create({ logLevel: 'debug' });
  const user = await signIn('user', 'password');

  console.log(user);
}

main().catch(console.error);
```
