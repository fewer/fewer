import { FieldType } from 'fewer';

interface TypeConfig {
  nonNull?: boolean;
  unique?: boolean;
  autoIncrement?: boolean;
}

function field<Obj, T>(name: string) {
  return function<Name extends string, Config extends TypeConfig>(
    this: FieldTypes,
    name: Name,
    config?: Config,
  ): FieldTypes<
    Obj &
      {
        [P in Name]: FieldType<
          Config['nonNull'] extends true ? T : T | undefined
        >
      }
  > {
    // @ts-ignore TS does not understand this:
    // TODO: Put this as a helper in the class itself:
    return new FieldTypes({
      ...this.fields,
      [name]: new FieldType(name),
    });
  };
}

export default class FieldTypes<Obj = {}> {
  fields: Obj;

  constructor(fields: Obj = {} as Obj) {
    this.fields = fields;
  }

  boolean = field<Obj, boolean>('boolean');
  // Numeric Types:
  int = field<Obj, number>('int');
  smallint = field<Obj, number>('smallint');
  integer = field<Obj, number>('integer');
  bigint = field<Obj, number>('bigint');
  double = field<Obj, number>('double precision');
  real = field<Obj, number>('real');
  // String types:
  char = field<Obj, string>('char');
  varchar = field<Obj, string>('varchar');
  text = field<Obj, string>('text');
}
