import { IInfoLogger } from './interfaces';

export default class Logger implements IInfoLogger {
  get #prefix() {
    const requestId = this.getRequestId();
    return requestId ? `${requestId} | ` : '';
  }
  constructor(
    public level: string,
    private getRequestId: () => string,
  ) {
    console.log(`${this.#prefix}Logger created with level ${level}`);
  }
  info(message: string) {
    if (this.level !== 'debug') return;
    console.log(`${this.#prefix}${message}`);
  }
}
