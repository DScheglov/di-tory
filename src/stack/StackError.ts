export enum StackErrorType {
  Empty,
  Exists,
}

export class StackError extends Error {
  static messages: Record<StackErrorType, string> = {
    [StackErrorType.Empty]: 'Stack is empty',
    [StackErrorType.Exists]: 'Item already exists in stack',
  };

  static Empty = new StackError(StackErrorType.Empty);
  static Exists = new StackError(StackErrorType.Exists);

  constructor(type: StackErrorType) {
    super(StackError.messages[type]);
  }
}
