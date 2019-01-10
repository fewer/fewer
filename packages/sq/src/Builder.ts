export default class Builder<T> {
  protected context: T;

  constructor(context: T) {
    this.context = context;
  }

  get() {
      return this.context;
  }

  next(changes: Partial<T>): this {
    return new (this.constructor as any)({
      ...this.context,
      ...changes,
    });
  }
}
