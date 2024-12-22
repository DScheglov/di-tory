export type Result<T, E> =
  | { ok: true; data: T } //
  | { ok: false; error: E };

export interface IInfoLogger {
  info(message: string): void;
}

export type User = {
  id: string;
  name: string;
  passwordHash: string;
};

export interface IUserRepository {
  getUser(userName: string): Promise<User | null>;
}

export interface IAuthService {
  authenticate(
    userName: string,
    password: string,
  ): Promise<Result<Omit<User, 'passwordHash'>, 'invalid-credentials'>>;
}

export interface Getter<T> {
  get(): T;
}

export interface Setter<T> {
  set(value: T): void;
}
