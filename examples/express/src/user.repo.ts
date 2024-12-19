import { IInfoLogger, IUserRepository } from './interfaces';

export default class UserRepository implements IUserRepository {
  constructor(private readonly logger: IInfoLogger) {
    logger.info('UserRepository instance created');
  }
  async getUser(userName: string) {
    this.logger.info(`Getting user ${userName}`);

    await new Promise((resolve) => setTimeout(resolve, 5_000 * Math.random()));

    return {
      id: '1',
      name: userName,
      passwordHash: 'password',
    };
  }
}
