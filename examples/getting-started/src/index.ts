import { Module } from 'di-tory';
import { Logger } from './Logger';
import { UserRepository } from './UserRepository';
import { AuthService } from './AuthService';

const App = Module()
  .private({
    logger: (_, { logLevel }: { logLevel: string }) => new Logger(logLevel),
  })
  .private({
    userRepository: ({ logger }) => new UserRepository(logger),
  })
  .private({
    authService: ({ userRepository, logger }) =>
      new AuthService(userRepository, logger),
  })
  .publicImpl({
    async signIn({ authService, logger }, userName: string, password: string) {
      logger.info(`Authenticating user: ${userName}`);
      const user = await authService.authenticate(userName, password);
      logger.info(`User authenticated: ${user.name}`);

      return user;
    },
  });

async function main() {
  const app = App.create({ logLevel: 'debug' });
  await app.signIn('Superuser', 'password');
}

main().catch(console.error);
