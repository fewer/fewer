import { WithUndefinedPropertiesAsOptionals } from './typeHelpers';
import { INTERNAL_TYPES } from '../types';
import { Database, Adapter } from '../Database';
import FieldType from '../FieldType';

type TableOptions =
  | {
      force?: boolean;
    }
  | null
  | undefined;

export interface FieldTypes {
  [key: string]: FieldType;
}

type BuiltTable<T extends FieldTypes> = {
  [P in keyof T]: T[P][INTERNAL_TYPES.INTERNAL_TYPE]
};

export class SchemaTable<
  DBAdapter extends Adapter = any,
  T extends InstanceType<DBAdapter['FieldTypes']> = any
> {
  // TODO: Should we resolve this here, or inside of the repository itself?
  [INTERNAL_TYPES.INTERNAL_TYPE]: WithUndefinedPropertiesAsOptionals<
    BuiltTable<T[INTERNAL_TYPES.INTERNAL_TYPE]>
  >;

  name: string;

  constructor(
    name: string,
    config: TableOptions,
    builder: (t: DBAdapter['FieldTypes']) => T,
  ) {
    this.name = name;
  }
}

export class Schema<DBAdapter extends Adapter, RegisteredTables = {}> {
  database: Database;
  version: number | undefined;
  tables: RegisteredTables;

  constructor(
    database: Database,
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
  // TODO: Built is current instance of `FieldTypes`.
  // I need to probably unroll that type inside of the SchemaTable itself when stashing
  // the type. Otherwise we can just keep the FieldTypes instance around.
  table<
    TableName extends string,
    Built extends InstanceType<DBAdapter['FieldTypes']>
  >(
    name: TableName,
    config: TableOptions,
    builder: (t: InstanceType<DBAdapter['FieldTypes']>) => Built,
  ): Schema<
    DBAdapter,
    RegisteredTables & { [P in TableName]: SchemaTable<DBAdapter, Built> }
  > {
    const table = new SchemaTable(name, config, builder);
    return new Schema(this.database, this.version, {
      ...this.tables,
      [name]: table,
    });
  }
}

export { FieldType };

/**
 * TODO: Documentation.
 */
export function createSchema<DBAdapter extends Adapter>(
  database: Database<DBAdapter>,
  version?: number,
) {
  return new Schema<DBAdapter>(database, version);
}
