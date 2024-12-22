import { IInfoLogger, IAuthService } from './interfaces';

type SignInDependencies = {
  logger: IInfoLogger;
  authService: Pick<IAuthService, 'authenticate'>;
};


export function signIn(
  { authService, logger }: SignInDependencies,
  userName: string,
  password: string
) {
  logger.info(`Authenticating user: ${userName}`);
  return authService.authenticate(userName, password);
}
