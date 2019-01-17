import { WithUndefinedPropertiesAsOptionals } from './typeHelpers';
import { INTERNAL_TYPES } from '../types';
import { Database } from '../Database';
import { Adapter } from '../Adapter';
import FieldType from '../FieldType';

type TableOptions =
  | {
      force?: boolean;
    }
  | null
  | undefined;

interface TableProperties {
  [key: string]: FieldType;
}

type BuiltTable<T extends TableProperties> = {
  [P in keyof T]: T[P][INTERNAL_TYPES.INTERNAL_TYPE]
};

export class SchemaTable<
  DBAdapter extends Adapter = any,
  T extends TableProperties = any
> {
  // TODO: Should we resolve this here, or inside of the repository itself?
  readonly [INTERNAL_TYPES.INTERNAL_TYPE]: WithUndefinedPropertiesAsOptionals<
    BuiltTable<T>
  >;

  database: Database<DBAdapter>;
  name: string;

  constructor(
    database: Database<DBAdapter>,
    name: string,
    config: TableOptions,
    builder: (t: DBAdapter['FieldTypes']) => T,
  ) {
    this.database = database;
    this.name = name;
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
  // TODO: Built is current instance of `FieldTypes`.
  // I need to probably unroll that type inside of the SchemaTable itself when stashing
  // the type. Otherwise we can just keep the FieldTypes instance around.
  table<
    DBAdapter extends Adapter,
    TableName extends string,
    Built extends TableProperties
  >(
    database: Database<DBAdapter>,
    name: TableName,
    config: TableOptions,
    builder: (t: DBAdapter['FieldTypes']) => Built,
  ): Schema<
    RegisteredTables & { [P in TableName]: SchemaTable<DBAdapter, Built> }
  > {
    const table = new SchemaTable(database, name, config, builder);
    return new Schema(this.version, {
      ...this.tables,
      [name]: table,
    });
  }
}

export { FieldType };

/**
 * TODO: Documentation.
 */
export function createSchema(version?: number) {
  return new Schema(version);
}
