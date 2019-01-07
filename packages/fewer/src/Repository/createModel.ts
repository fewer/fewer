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
  /**
   * Used to get the errors that are currently attached to the model.
   */
  readonly errors: typeof Errors;
} = {
  isModel: IsModel,
  dirty: Dirty,
  changed: Changed,
  changes: Changes,
  valid: Valid,
  errors: Errors,
};

// NOTE: Intentionally type as any[] so that we can do un-guarded includes() lookups:
const SYMBOL_VALUES: any[] = Object.values(Symbols);

export interface SymbolProperties<T = any> {
  readonly [Symbols.isModel]: true;
  readonly [Symbols.dirty]: boolean;
  readonly [Symbols.changed]: (keyof T)[];
  readonly [Symbols.changes]: { [P in keyof T]: any };
  readonly [Symbols.valid]: boolean;
  readonly [Symbols.errors]: ValidationError<T>[];
}

const SetErrors: unique symbol = Symbol('setErrors');
const HasValidationRun: unique symbol = Symbol('hasValidationRun');

export const InternalSymbols: {
  setErrors: typeof SetErrors;
  hasValidationRun: typeof HasValidationRun;
} = {
  setErrors: SetErrors,
  hasValidationRun: HasValidationRun,
};

export interface InternalSymbolProperties {
  [InternalSymbols.setErrors]: (newErrors: ValidationError[]) => void;
  [InternalSymbols.hasValidationRun]: boolean;
}

export interface ValidationError<T = any> {
  /**
   * The field that contained the validation error.
   * If the validation error occured on the entire model, then this field should be omitted.
   */
  on?: keyof T;
  /**
   * The message for the validation error.
   */
  message: string;
}

const DEFAULT_ERRORS: ReadonlyArray<ValidationError> = Object.freeze([]);

export default function createModel<RepoType, T extends object>(
  obj: T,
): T & Partial<RepoType> & SymbolProperties<RepoType> {
  const changes = new Map();

  let hasValidationRun = false;
  let errors: ReadonlyArray<ValidationError> = DEFAULT_ERRORS;

  function setErrors(newErrors: ValidationError[]) {
    // Errors get set when running validation, so we mark that we have run validation when we set the errors:
    hasValidationRun = true;
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
        case Symbols.changes: {
          const map: { [key: string]: any } = {};
          for (const prop of changes.keys()) {
            map[prop] = changes.get(prop);
          }
          return Object.freeze(map);
        }
        case Symbols.changed:
          return Object.freeze([...changes.keys()]);
        case Symbols.valid:
          return hasValidationRun && errors.length === 0;
        case Symbols.errors:
          return errors;

        // Internal symbols:
        case InternalSymbols.setErrors:
          return setErrors;
        case InternalSymbols.hasValidationRun:
          return hasValidationRun;

        default:
          return Reflect.get(target, prop, receiver);
      }
    },

    set(obj, prop, value) {
      if (typeof prop === 'symbol' && SYMBOL_VALUES.includes(prop)) {
        throw new Error('Cannot set Fewer Symbol properties');
      }

      // Reset our validation state:
      hasValidationRun = false;

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
