import type { IAuthService, IUserRepository } from "./interfaces";

export class AuthService implements IAuthService {
  constructor(private userRepo: IUserRepository) { }

  async authenticate(userName: string, password: string) {
    const user = await this.userRepo.getUser(userName);

    if (user.passwordHash !== password) {
      throw new Error('Invalid password');
    }

    return user;
  }
}
