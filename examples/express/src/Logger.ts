import type { IInfoLogger } from './interfaces';

export default class Logger implements IInfoLogger {
  #requestId: { get(): string };

  constructor(
    public level: string,
    requestId: { get(): string },
  ) {
    this.#requestId = requestId;
    this.info(`>>> Logger created with level ${level} <<<`);
  }

  get #prefix() {
    const requestId = this.#requestId.get();
    return requestId ? `| ${requestId} | ` : '';
  }

  info(message: string) {
    if (this.level !== 'debug') return;
    console.log(`${this.#prefix}${message}`);
  }
}
