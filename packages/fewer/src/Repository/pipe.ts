import { ValidationError } from './createModel';

export interface Pipe<RepoType = any, Extensions = RepoType> {
  /**
   * Set an object up. Add virtuals and other properties.
   */
  prepare?(obj: RepoType & Partial<Extensions>): void;
  /**
   * Middleware.
   */
  use?(
    obj: RepoType & Partial<Extensions>,
    next: () => Promise<void>,
  ): Promise<void>;
  // TODO: This also needs to be async:
  /**
   * Perform validation. Return either undefined or null to signal no validation errors.
   * Return either an array of Validation Errors, or a single validation error.
   *
   * @example
   * return {
   *   on: 'name',
   *   message: 'No name was provided',
   * }
   */
  validate?(
    obj: RepoType & Partial<Extensions>,
  ):
    | void
    | undefined
    | null
    | ValidationError<RepoType & Extensions>
    | ValidationError<RepoType & Extensions>[];
}
