import type { IUserRepository } from './interfaces';

export class UserRepository implements IUserRepository {
  async getUser(userName: string) {
    return {
      id: '1',
      name: userName,
      passwordHash: 'password',
    };
  }
}
