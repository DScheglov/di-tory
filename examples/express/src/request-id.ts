export default class RequestId {
  #requestId: string = '';

  get requestId(): string {
    return this.#requestId;
  }

  set requestId(value: string | undefined) {
    this.#requestId = value || Math.random().toFixed(20).slice(2);
  }
}
