import { WithUndefinedPropertiesAsOptionals } from './typeHelpers';
import { INTERNAL_TYPES } from '../types';
import { Database } from '../Database';
import { Adapter } from '../Adapter';
import ColumnType from '../ColumnType';

interface TableProperties {
  [key: string]: ColumnType;
}

type BuiltTable<T extends TableProperties> = {
  [P in keyof T]: T[P][INTERNAL_TYPES.INTERNAL_TYPE]
};

export class SchemaTable<
  DBAdapter extends Adapter = any,
  T = any
> {
  readonly [INTERNAL_TYPES.INTERNAL_TYPE]: T;

  database: Database<DBAdapter>;
  name: string;
  config: DBAdapter['TableTypes'];
  primaryKey: keyof T;

  constructor(
    database: Database<DBAdapter>,
    name: string,
    config: DBAdapter['TableTypes'],
    builder: (t: DBAdapter['ColumnTypes']) => TableProperties,
  ) {
    this.database = database;
    this.name = name;
    this.config = config;
    this.primaryKey = config.primaryKey;
  }
}

export class Schema<RegisteredTables = {}> {
  version: number | undefined;
  tables: RegisteredTables;

  constructor(version?: number, tables = {} as RegisteredTables) {
    this.version = version;
    this.tables = tables;
  }

  /**
   * TODO: Documentation.
   */
  table<
    DBAdapter extends Adapter,
    TableName extends string,
    Built extends TableProperties
  >(
    database: Database<DBAdapter>,
    name: TableName,
    config: DBAdapter['TableTypes'],
    builder: (t: DBAdapter['ColumnTypes']) => Built,
  ): Schema<
    RegisteredTables &
      {
        [P in TableName]: SchemaTable<
          DBAdapter,
          WithUndefinedPropertiesAsOptionals<BuiltTable<Built>>
        >
      }
  > {
    const table = new SchemaTable(database, name, config, builder);
    // @ts-ignore TODO:
    return new Schema(this.version, {
      ...this.tables,
      [name]: table,
    });
  }
}

export { ColumnType };

/**
 * TODO: Documentation.
 */
export function createSchema(version?: number) {
  return new Schema(version);
}
