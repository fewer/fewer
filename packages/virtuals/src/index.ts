import { Pipe } from 'fewer';

export function virtuals<Instance, Extensions>(
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
