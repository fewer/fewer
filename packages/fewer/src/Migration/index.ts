import { Database } from '../Database';
import { Adapter, FieldTypes } from '../Adapter';
import FieldType from '../FieldType';

export class Migration<DBAdapter extends Adapter = any> {
  database: Database;
  definition: MigrationDefinition;

  constructor(database: Database, definition: MigrationDefinition) {
    this.database = database;
    this.definition = definition;
  }

  createTable(
    name: string,
    options: DBAdapter['TableTypes'] | null | undefined,
    types: { [columnName: string]: FieldType },
  ) {
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
  return new Migration(db, definition);
}
