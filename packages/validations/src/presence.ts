import { Pipe, ValidationError } from 'fewer';

export function withPresence<Instance, FieldName extends keyof Instance>(
  ...fieldNames: FieldName[]
): Pipe<Instance> {
  return {
    validate(obj) {
      const errors: ValidationError<Instance>[] = [];

      fieldNames.forEach(fieldName => {
        if (!obj[fieldName]) {
          errors.push({
            on: fieldName,
            message: 'field is not present',
          });
        }
      });

      return errors;
    },
  };
}
