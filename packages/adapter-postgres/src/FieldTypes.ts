import { FieldType, FieldTypes as BaseFieldTypes } from 'fewer';

interface TypeConfig {
  nonNull?: boolean;
  unique?: boolean;
  autoIncrement?: boolean;
}

interface Fields {
  [key: string]: FieldType;
}

export default class FieldTypes<Obj extends Fields = {}> extends BaseFieldTypes<
  Obj
> {
  private columnType<T>(columnName: string) {
    return <Name extends string, Config extends TypeConfig>(
      name: Name,
      config?: Config,
    ): FieldTypes<
      Obj &
        {
          [P in Name]: FieldType<
            Config['nonNull'] extends true ? T : T | undefined
          >
        }
    > => {
      return this.addField(name, new FieldType(name));
    };
  }

  boolean = this.columnType<boolean>('boolean');
  // Numeric Types:
  int = this.columnType<number>('int');
  smallint = this.columnType<number>('smallint');
  integer = this.columnType<number>('integer');
  bigint = this.columnType<number>('bigint');
  double = this.columnType<number>('double precision');
  real = this.columnType<number>('real');
  // String types:
  char = this.columnType<string>('char');
  varchar = this.columnType<string>('varchar');
  text = this.columnType<string>('text');
}
