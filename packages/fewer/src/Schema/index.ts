import * as FieldTypes from './FieldTypes';
import { WithUndefinedPropertiesAsOptionals } from './typeHelpers';
import { Database, globalDatabase } from '../Database';

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
  // TODO: There's probably a way to infer this rather than do it this way:
  [P in keyof Built]: Built[P]['$$Type']
};

export class SchemaTable<T extends BaseBuilt> {
  $$Type!: WithUndefinedPropertiesAsOptionals<BuiltTable<T>>;

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
  database?: Database;

  constructor(version: number, tables = {} as RegisteredTables) {
    this.version = version;
    this.tables = tables;
    this.wireDatabase();
  }

  // TODO: This needs to have other options to eventually support multi-db setups.
  private wireDatabase() {
    globalDatabase.wait((db) => {
      this.database = db;
    });
  }

  table<TableName extends string, Built extends BaseBuilt>(
    name: TableName,
    config: TableOptions,
    builder: (t: typeof FieldTypes) => Built,
  ): Schema<RegisteredTables & { [P in TableName]: SchemaTable<Built> }> {
    const table = new SchemaTable(name, config, builder);
    return new Schema(this.version, { ...this.tables, [name]: table });
  }
}

export function createSchema(version: number) {
  return new Schema(version);
}
