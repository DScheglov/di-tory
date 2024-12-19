import { IAuthService, IInfoLogger, IUserRepository } from './interfaces';

export default class AuthService implements IAuthService {
  constructor(
    private userRepo: IUserRepository,
    private logger: IInfoLogger,
  ) {
    this.logger.info('AuthService instance created');
  }

  async authenticate(userName: string, password: string) {
    this.logger.info(`Authenticating user ${userName}`);
    const user = await this.userRepo.getUser(userName);

    if (user.passwordHash !== password) {
      return { ok: false, error: 'invalid-credentials' } as const;
    }

    return { ok: true as const, data: user };
  }
}
