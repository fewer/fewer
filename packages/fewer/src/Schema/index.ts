import * as FieldTypes from './FieldTypes';

type TableOptions =
  | {
      force?: boolean;
    }
  | null
  | undefined;

class Table<T = {}> {
  constructor(
    name: string,
    config: TableOptions,
    builder: (t: typeof FieldTypes) => T,
  ) {
    // TODO: Something.
  }
}

export interface BaseBuilt {
  [key: string]: FieldTypes.Type<any, boolean>;
}

type BuiltTable<Built extends BaseBuilt> = {
  // TODO: There's probably a way to infer this rather than do it this way:
  [P in keyof Built]: Built[P]['$$Type'];
};

type BuildSchema<Tables, TableName extends string, Built extends BaseBuilt> = Tables &
  { [P in TableName]: BuiltTable<Built> };

export default class Schema<RegisteredTables = {}> {
  //  Intentionally stash types so that we can refer back to them:
  readonly $$RegisteredTables!: RegisteredTables;

  version: number;
  tables: RegisteredTables;

  constructor(
    version: number,
    tables: RegisteredTables = {} as RegisteredTables,
  ) {
    this.version = version;
    this.tables = tables;
  }

  createTable<TableName extends string, Built extends BaseBuilt>(
    name: TableName,
    config: TableOptions,
    builder: (t: typeof FieldTypes) => Built,
  ): Schema<BuildSchema<RegisteredTables, TableName, Built>> {
    const table = new Table(name, config, builder);
    // @ts-ignore: Need to type this better at some point:
    return new Schema(this.version, { ...this.tables, [name]: table });
  }
}
