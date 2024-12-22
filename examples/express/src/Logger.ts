import type { IInfoLogger } from './interfaces';

export default class Logger implements IInfoLogger {
  #getRequestId: () => string;

  constructor(
    public level: string,
    getRequestId: () => string,
  ) {
    this.#getRequestId = getRequestId;
    console.log(`${this.#prefix}Logger created with level ${level}`);
  }

  get #prefix() {
    const requestId = this.#getRequestId();
    return requestId ? `| ${requestId} | ` : '';
  }

  info(message: string) {
    if (this.level !== 'debug') return;
    console.log(`${this.#prefix}${message}`);
  }
}
