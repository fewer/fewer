import { FieldType } from 'fewer';

export interface TypeConfig {
  nonNull?: boolean;
  unique?: boolean;
  autoIncrement?: boolean;
}

function columnType<T, AdditionalConfig extends TypeConfig = TypeConfig>(name: string) {
  return function<Config extends AdditionalConfig>(
    config: Config,
  ): FieldType<Config['nonNull'] extends true ? T : T | undefined> {
    return new FieldType(name);
  };
}

export default {
  boolean: columnType<boolean>('boolean'),
  // Numeric Types:
  int: columnType<number>('int'),
  smallint: columnType<number>('smallint'),
  integer: columnType<number>('integer'),
  bigint: columnType<number>('bigint'),
  double: columnType<number>('double'),
  real: columnType<number>('real'),
  // String types:
  char: columnType<string>('char'),
  varchar: columnType<string>('varchar'),
  text: columnType<string>('text'),
};
