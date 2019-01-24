export default class Builder<T> {
  context: T;

  constructor(context: T) {
    this.context = context;
  }

  /**
   * @deprecated Use Sq#context directly instead.
   */
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
