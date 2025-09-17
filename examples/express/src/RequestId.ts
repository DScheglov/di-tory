export default class RequestId {
  #requestId: string = '';

  get(): string {
    return this.#requestId;
  }

  set(value: string | undefined) {
    this.#requestId = value || Math.random().toFixed(20).slice(2);
  }
}
