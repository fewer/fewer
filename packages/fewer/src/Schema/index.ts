import * as FieldTypes from './FieldTypes';
import { WithUndefinedPropertiesAsOptionals } from './typeHelpers';
import { INTERNAL_TYPE } from '../types';

type TableOptions =
  | {
      force?: boolean;
    }
  | null
  | undefined;

export interface BaseBuilt {
  [key: string]: FieldTypes.Type<any, boolean>;
}

type BuiltTable<Built extends BaseBuilt> = {
  [P in keyof Built]: Built[P][typeof INTERNAL_TYPE]
};

export class SchemaTable<T extends BaseBuilt> {
  [INTERNAL_TYPE]: WithUndefinedPropertiesAsOptionals<BuiltTable<T>>;

  name: string;

  constructor(
    name: string,
    config: TableOptions,
    builder: (t: typeof FieldTypes) => T,
  ) {
    this.name = name;
  }
}

export class Schema<RegisteredTables = {}> {
  version: number;
  tables: RegisteredTables;

  constructor(version: number, tables = {} as RegisteredTables) {
    this.version = version;
    this.tables = tables;
  }

  /**
   * TODO: Documentation.
   */
  table<TableName extends string, Built extends BaseBuilt>(
    name: TableName,
    config: TableOptions,
    builder: (t: typeof FieldTypes) => Built,
  ): Schema<RegisteredTables & { [P in TableName]: SchemaTable<Built> }> {
    const table = new SchemaTable(name, config, builder);
    return new Schema(this.version, { ...this.tables, [name]: table });
  }
}

/**
 * TODO: Documentation.
 */
export function createSchema(version: number) {
  return new Schema(version);
}
