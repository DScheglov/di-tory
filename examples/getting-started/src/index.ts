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
    signIn, //
  });

async function main() {
  const app = App.create({ logLevel: 'debug' });
  const user = await app.signIn('user', 'password');

  console.log(user);
}

main().catch(console.error);
