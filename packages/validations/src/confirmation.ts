import { Pipe } from 'fewer';

export function confirmation<
  Instance,
  FieldName extends keyof Instance,
  ConfirmationFieldName extends string
>(
  fieldName: FieldName,
  confirmationFieldName: ConfirmationFieldName,
  config: {
    caseSensitive?: boolean;
  } = {},
): Pipe<Instance, { [P in ConfirmationFieldName]: Instance[FieldName] }> {
  return {
    validate(obj) {
      if (obj[confirmationFieldName]) {
        const { caseSensitive = true } = config;

        let matches = false;
        if (caseSensitive) {
          matches = obj[fieldName] === obj[confirmationFieldName];
        } else {
          matches =
            String(obj[fieldName]).toLowerCase() ===
            String(obj[confirmationFieldName]).toLowerCase();
        }

        if (!matches) {
          return {
            on: fieldName,
            message: 'does not match confirmation',
          };
        }
      }
    },
  };
}
