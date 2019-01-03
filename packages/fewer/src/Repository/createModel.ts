export const IsModel = Symbol('isModel');
export const Dirty = Symbol('dirty');
export const Changed = Symbol('changed');
export const Changes = Symbol('changes');
export const Valid = Symbol('valid');
export const Errors = Symbol('errors');

export const Symbols: {
  /**
   * Used to check if an object is a fewer model.
   */
  readonly isModel: typeof IsModel;
  /**
   * Used to determine if any of the properties on the model have been changed.
   */
  readonly dirty: typeof Dirty;
  /**
   * Used to determine the set of properties on the model that have been changed.
   */
  readonly changed: typeof Changed;
  /**
   * Used to determine the original value of properties that have changed on the model.
   */
  readonly changes: typeof Changes;
  /**
   * Used to determine if the model is valid.
   */
  readonly valid: typeof Valid;
  readonly errors: typeof Errors;
} = {
  isModel: IsModel,
  dirty: Dirty,
  changed: Changed,
  changes: Changes,
  valid: Valid,
  errors: Errors,
};

export interface SymbolProperties<T = any> {
  readonly [Symbols.isModel]: true;
  readonly [Symbols.dirty]: boolean;
  readonly [Symbols.changed]: Set<string | symbol | number>;
  readonly [Symbols.changes]: Map<string | symbol | number, any>;
  readonly [Symbols.valid]: boolean;
  // TODO: Figure out the shape of errors:
  readonly [Symbols.errors]: ValidationError<T>[];
}

export const InternalSymbols = {
  setErrors: Symbol('setErrors'),
};

export interface ValidationError<T = any> {
  on?: T;
  message: string;
}

const DEFAULT_ERRORS: ReadonlyArray<ValidationError> = Object.freeze([]);

export default function createModel<RepoType, T extends object>(
  obj: T,
): T & Partial<RepoType> & SymbolProperties {
  const changes = new Map();

  let errors: ReadonlyArray<ValidationError> = DEFAULT_ERRORS;

  function setErrors(newErrors: ValidationError[]) {
    errors = Object.freeze(newErrors);
  }

  // @ts-ignore The proxy implementation here is hard for TypeScript to understand.
  return new Proxy(obj, {
    get(target, prop, receiver) {
      // TODO: We should probably break this out into a function to get the symbol properties:
      switch (prop) {
        case Symbols.isModel:
          return true;
        case Symbols.dirty:
          return changes.size > 0;
        case Symbols.changes:
          return changes;
        case Symbols.changed:
          return new Set(changes.keys());
        // TODO: Expose hooks to perform validation + add errors:
        case Symbols.valid:
          return errors.length === 0;
        case Symbols.errors:
          return errors;

        // Internal symbols:
        case InternalSymbols.setErrors:
          return setErrors;

        default:
          return Reflect.get(target, prop, receiver);
      }
    },

    set(obj, prop, value) {
      if (changes.has(prop)) {
        // If the value is reset to the original value then there is no work to do:
        if (changes.get(prop) === value) {
          changes.delete(prop);
        }
      } else {
        changes.set(prop, Reflect.get(obj, prop));
      }

      return Reflect.set(obj, prop, value);
    },
  });
}
