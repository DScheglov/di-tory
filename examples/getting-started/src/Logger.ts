import type { IInfoLogger } from './interfaces';

export class Logger implements IInfoLogger {
  constructor(public level: string) {}
  info(message: string) {
    if (this.level !== 'debug') return;
    console.log(message);
  }
}
