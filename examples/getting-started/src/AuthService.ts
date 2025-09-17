import type { IAuthService, IInfoLogger, IUserRepository } from './interfaces';

export class AuthService implements IAuthService {
  #userRepo: IUserRepository;
  #logger: IInfoLogger;

  constructor(userRepo: IUserRepository, logger: IInfoLogger) {
    this.#userRepo = userRepo;
    this.#logger = logger;

    logger.info('>>> AuthService created');
  }

  async authenticate(userName: string, password: string) {
    this.#logger.info(`>>> AuthService.authenticate(${userName})`);

    const user = await this.#userRepo.getUser(userName);

    if (user.passwordHash !== password) {
      throw new Error('Invalid password');
    }

    return user;
  }
}
