import { ColumnType } from 'fewer';

export interface ColumnOptions {
  nonNull?: boolean;
  unique?: boolean;
  default?: any;
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

export interface ArrayOptions<T> extends ColumnOptions {
  type: T;
}

function columnType<T, Config extends ColumnOptions = ColumnOptions>(
  name: string,
  reflectName?: string,
) {
  return function(
    config?: Config,
  ): ColumnType<Config['nonNull'] extends true ? T : T | undefined, Config> {
    return new ColumnType(name, config, reflectName || name);
  };
}

const columnTypes = {
  // Boolean Type:
  boolean: columnType<boolean>('boolean'),

  // Numeric Types:
  numeric: columnType<number, NumericOptions>('numeric'),
  decimal: columnType<number, NumericOptions>('decimal'),
  smallint: columnType<number>('smallint'),
  integer: columnType<number>('integer'),
  int: columnType<number>('int'),
  bigint: columnType<number>('bigint'),
  double: columnType<number>('double precision', 'double'),
  real: columnType<number>('real'),
  // Numeric Serial Types (automatiocally non null):
  smallserial: (options?: ColumnOptions) =>
    new ColumnType<number>('smallserial', options),
  serial: (options?: ColumnOptions) =>
    new ColumnType<number>('serial', options),
  bigserial: (options?: ColumnOptions) =>
    new ColumnType<number>('bigserial', options),

  // Character Types:
  char: columnType<string, CharacterOptions>('char'),
  varchar: columnType<string, CharacterOptions>('varchar'),
  text: columnType<string>('text'),
  string: (options?: CharacterOptions) =>
    columnTypes.varchar({ length: 255, ...options }),

  // Binary Data Types:
  bytea: columnType<string>('bytea'),

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

  // TODO: Array Types, Date/Time Types, Monetary Types, Network Address Types, Bit String Types, Text Search Types, XML Type, Range Types, Custom Types
};

export default columnTypes;
