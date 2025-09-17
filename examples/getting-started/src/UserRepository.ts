import type { IInfoLogger, IUserRepository } from './interfaces';

export class UserRepository implements IUserRepository {
  #logger: IInfoLogger;

  constructor(logger: IInfoLogger) {
    this.#logger = logger;
    logger.info('>>> UserRepository created');
  }

  async getUser(userName: string) {
    this.#logger.info(`>>> UserRepository.getUser(${userName})`);

    return {
      id: '1',
      name: userName,
      passwordHash: 'password',
    };
  }
}
