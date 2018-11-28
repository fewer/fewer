type TableOptions =
  | {
      force?: boolean;
    }
  | null
  | undefined;

interface TTypes {
  string: string;
  datetime: string;
  text: string;
  boolean: boolean;
  optional<T>(type: T): T | null | undefined;
}

class Table<T = {}> {
  constructor(name: string, config: TableOptions, builder: (t: TTypes) => T) {
    // TODO: Something.
  }
}

type BuildSchema<Tables, TableName extends string, Built> = Tables &
  { [P in TableName]: Built };

interface Tables {
  [name: string]: Table;
}

export default class Schema<RegisteredTables = {}> {
  //  Intentionally stash types so that we can refer back to them:
  readonly $$RegisteredTables!: RegisteredTables;

  version: number;
  tables: RegisteredTables;

  constructor(version: number, tables: RegisteredTables = ({} as RegisteredTables)) {
    this.version = version;
    this.tables = tables;
  }

  createTable<TableName extends string, Built>(
    name: TableName,
    config: TableOptions,
    builder: (t: TTypes) => Built,
  ): Schema<BuildSchema<RegisteredTables, TableName, Built>> {
    const table = new Table(name, config, builder);
    return new Schema(this.version, { ...this.tables, [name]: table });
  }
}
