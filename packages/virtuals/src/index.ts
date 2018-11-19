// TODO: Expose pipe type somewhere:
interface Pipe<RepoType = any, Extensions = RepoType> {
  prepare(obj: RepoType & Extensions): void;
  save?(obj: RepoType, next: () => Promise<void>): Promise<void>;
}

export function createVirtuals<Instance, Extensions>(
  config: (instance: Instance) => Extensions,
): Pipe<Instance, Extensions> {
  return {
    prepare(instance: Instance) {
      const configuration = config(instance);
      for (const prop in configuration) {
        const descriptor = Object.getOwnPropertyDescriptor(configuration, prop);
        if (descriptor) {
          Object.defineProperty(instance, prop, descriptor);
        }
      }
    },
  };
}
