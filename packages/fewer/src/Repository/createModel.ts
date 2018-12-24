const Dirty: unique symbol = Symbol('dirty');
const Changed: unique symbol = Symbol('dirty');

export const Symbols: {
  /**
   * Used to determine if any of the properties on the model have been changed.
   */
  readonly dirty: typeof Dirty;
  /**
   * Used to determine the set of properties on the model that have been changed.
   */
  readonly changed: typeof Changed;
} = {
  dirty: Dirty,
  changed: Changed,
};

type PropertySet = Set<string | symbol | number>;

export interface SymbolProperties {
  readonly [Dirty]: boolean;
  readonly [Changed]: PropertySet;
}

export default function createModel<RepoType, T extends object>(
  obj: T,
): T & Partial<RepoType> & SymbolProperties {
  let changed: PropertySet = new Set();

  // @ts-ignore The proxy implementation here is hard for TypeScript to understand.
  return new Proxy(obj, {
    get(target, prop, receiver) {
      if (prop === Dirty) {
        return changed.size > 0;
      }

      if (prop === Changed) {
        return changed;
      }

      return Reflect.get(target, prop, receiver);
    },

    set(obj, prop, value) {
      changed.add(prop);

      return Reflect.set(obj, prop, value);
    },
  });
}
