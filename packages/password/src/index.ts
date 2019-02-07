import { Pipe } from 'fewer';
import bcrypt from 'bcrypt';

type StringPropertyNames<T> = Exclude<
  {
    [K in keyof T]: Exclude<T[K], undefined> extends string ? K : never
  }[keyof T],
  undefined
>;

export function password<Instance, Virtual extends string>(
  virtualField: Virtual,
  hashedField: StringPropertyNames<Instance>,
  saltRounds: number = 12,
): Pipe<
  Instance,
  { [P in Virtual]?: string } & {
    authenticate(passwordToCheck: string): Promise<boolean>;
  }
> {
  return {
    async use(instance) {
      if (instance[virtualField]) {
        // @ts-ignore: Prevent the index type from causing errors:
        instance[hashedField] = await bcrypt.hash(
          instance[virtualField],
          saltRounds,
        );
      }
    },
    prepare(instance) {
      // @ts-ignore: Prevent the index type from causing errors:
      instance.authenticate = async (password: string) => {
        if (!instance[hashedField]) {
          throw new Error(
            `The hashed field "${hashedField}" was not present, can not authenticate`,
          );
        }

        return await bcrypt.compare(password, instance[hashedField] as string);
      };
    },
  };
}
