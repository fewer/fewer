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

export class SchemaTable<DBAdapter extends Adapter = any, T = any> {
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

export class Schema<DBAdapter extends Adapter = any, RegisteredTables = {}> {
  database: Database<DBAdapter>;
  version: number | undefined;
  tables: RegisteredTables;

  constructor(
    database: Database<DBAdapter>,
    version?: number,
    tables = {} as RegisteredTables,
  ) {
    this.database = database;
    this.version = version;
    this.tables = tables;
  }

  /**
   * TODO: Documentation.
   */
  table<TableName extends string, Built extends TableProperties>(
    name: TableName,
    config: DBAdapter['TableTypes'],
    builder: (t: DBAdapter['ColumnTypes']) => Built,
  ): Schema<
    DBAdapter,
    RegisteredTables &
      {
        [P in TableName]: SchemaTable<
          DBAdapter,
          WithUndefinedPropertiesAsOptionals<BuiltTable<Built>>
        >
      }
  > {
    const table = new SchemaTable(this.database, name, config, builder);
    return new Schema(
      this.database,
      this.version,
      {
        ...this.tables,
        [name]: table,
      } as any /* Any is used here because this is challenging to get type safe. */,
    );
  }
}

export { ColumnType };

/**
 * TODO: Documentation.
 */
export function createSchema<DBAdapter extends Adapter>(
  database: Database<DBAdapter>,
  version?: number,
) {
  return new Schema<DBAdapter>(database, version);
}
