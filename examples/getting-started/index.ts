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
    signIn, //
  });

async function main() {
  const app = App.create({ logLevel: 'debug' });
  const user = await app.signIn('user', 'password');

  console.log(user);
}

main().catch(console.error);
