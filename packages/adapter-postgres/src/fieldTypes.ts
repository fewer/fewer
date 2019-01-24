import { FieldType } from 'fewer';

export interface ColumnOptions {
  nonNull?: boolean;
  unique?: boolean;
  default?: any;
  primaryKey?: boolean;
}

export interface NumericOptions extends ColumnOptions {
  precision?: number;
  scale?: number;
}

export interface CharacterOptions extends ColumnOptions {
  length?: number;
}

export interface PathOptions extends ColumnOptions {
  open?: boolean;
}

function columnType<T, AdditionalConfig extends ColumnOptions = ColumnOptions>(
  name: string,
) {
  return function<Config extends AdditionalConfig>(
    config?: Config,
  ): FieldType<Config['nonNull'] extends true ? T : T | undefined> {
    return new FieldType(name, config);
  };
}

const fieldTypes = {
  // Boolean Type:
  boolean: columnType<boolean>('boolean'),

  // Numeric Types:
  numeric: columnType<number, NumericOptions>('numeric'),
  decimal: columnType<number, NumericOptions>('decimal'),
  smallint: columnType<number>('smallint'),
  integer: columnType<number>('integer'),
  int: columnType<number>('int'),
  bigint: columnType<number>('bigint'),
  double: columnType<number>('double precision'),
  real: columnType<number>('real'),
  // Numeric Serial Types (automatiocally non null):
  smallserial: (options?: ColumnOptions) =>
    new FieldType<number>('smallserial', options),
  serial: (options?: ColumnOptions) => new FieldType<number>('serial', options),
  bigserial: (options?: ColumnOptions) =>
    new FieldType<number>('bigserial', options),

  // Character Types:
  char: columnType<string, CharacterOptions>('char'),
  varchar: columnType<string, CharacterOptions>('varchar'),
  text: columnType<string>('text'),
  string: (options?: CharacterOptions) =>
    fieldTypes.varchar({ length: 255, ...options }),

  // Binary Data Types:
  bytea: columnType<string>('bytea'),

  // TODO: Date/Time Types, Monetary Types, Network Address Types, Bit String Types, Text Search Types, XML Type, Range Types, Custom Types

  // Geometric Types:
  point: columnType<[number, number]>('point'),
  line: columnType<{ A: number; B: number; C: number }>('line'),
  lseg: columnType<[[number, number], [number, number]]>('lseg'),
  box: columnType<[[number, number], [number, number]]>('box'),
  path: columnType<[number, number][], PathOptions>('path'),
  polygon: columnType<[number, number][], PathOptions>('polygon'),
  circle: columnType<[[number, number], number]>('circle'),

  // UUID Type:
  uuid: columnType<string>('uuid'),

  // JSON Types:
  json: columnType<object>('json'),
  jsonb: columnType<object>('jsonb'),

  // Array Types:
  array: <SubType extends FieldType>(
    subtype: SubType,
  ): FieldType<Array<SubType['$$type']>> => new FieldType('array', { subtype }),
};

export default fieldTypes;
