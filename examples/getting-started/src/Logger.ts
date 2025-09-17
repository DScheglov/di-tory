import type { IInfoLogger } from './interfaces';

export class Logger implements IInfoLogger {
  level: string;

  constructor(level: string) {
    this.level = level;
  }

  info(message: string) {
    if (this.level !== 'debug') return;
    console.log('|', message);
  }
}
