export function createVirtuals(configuration: object) {
    return {
        prepare(instance: object) {
            for (const prop in configuration) {
                const descriptor = Object.getOwnPropertyDescriptor(configuration, prop);
                if (descriptor) {
                    Object.defineProperty(instance, prop, descriptor);
                }
            }
        },
    };
};
