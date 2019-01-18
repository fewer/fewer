import { Database } from '../Database';
import { Adapter } from '../Adapter';
import FieldType from '../FieldType';

// TODO: Enum?
type MigrationType = 'change' | 'updown' | 'irreversible';

interface ColumnTypes {
  [columnName: string]: FieldType;
}

type Operation = {
  type: 'createTable';
  name: string;
  options: any;
  fields: ColumnTypes;
};

export class Migration<DBAdapter extends Adapter = any> {
  direction: 'up' | 'down';
  type: MigrationType;
  database: Database;
  definition: MigrationDefinition;
  operations: Operation[];

  constructor(
    type: MigrationType,
    database: Database,
    definition: MigrationDefinition,
  ) {
    this.direction = 'up';
    this.type = type;
    this.database = database;
    this.definition = definition;
    this.operations = [];
  }

  createTable(
    name: string,
    options: DBAdapter['TableTypes'] | null | undefined,
    fields: ColumnTypes,
  ) {
    this.operations.push({
      type: 'createTable',
      name,
      options,
      fields,
    });

    return this;
  }
}

type ChangeMigrationDefinition<DBAdapter extends Adapter> =
  | ((m: Migration<DBAdapter>, t: DBAdapter['FieldTypes']) => any)
  | {
      change: (m: Migration<DBAdapter>, t: DBAdapter['FieldTypes']) => any;
    };

interface UpDownMigrationDefinition<DBAdapter extends Adapter> {
  up: (m: Migration<DBAdapter>, t: DBAdapter['FieldTypes']) => any;
  down: (m: Migration<DBAdapter>, t: DBAdapter['FieldTypes']) => any;
}

interface IrreversibleMigrationDefinition<DBAdapter extends Adapter> {
  up: (m: Migration<DBAdapter>, t: DBAdapter['FieldTypes']) => any;
  irreversible: true;
}

export type MigrationDefinition<DBAdapter extends Adapter = any> =
  | ChangeMigrationDefinition<DBAdapter>
  | UpDownMigrationDefinition<DBAdapter>
  | IrreversibleMigrationDefinition<DBAdapter>;

export function createMigration<DBAdapter extends Adapter>(
  db: Database<DBAdapter>,
  definition: MigrationDefinition<DBAdapter>,
): Migration<DBAdapter> {
  const type = definition.hasOwnProperty('change')
    ? 'change'
    : definition.hasOwnProperty('down')
    ? 'updown'
    : 'irreversible';
  return new Migration(type, db, definition);
}
