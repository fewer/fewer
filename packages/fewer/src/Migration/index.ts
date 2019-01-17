import { Database } from '../Database';
import { Adapter, FieldTypes } from '../Adapter';

export class Migration {
  up: any;
  down: any;

  constructor() {
    this.up = 'up';
    this.down = 'down';
  }
}

type ChangeMigrationDefinition<FT extends FieldTypes> =
  | ((m: FT) => any)
  | {
      change: (m: FT) => any;
    };

interface UpDownMigrationDefinition<FT extends FieldTypes> {
  up: (m: FT) => any;
  down: (m: FT) => any;
}

interface IrreversibleMigrationDefinition<FT extends FieldTypes> {
  up: (m: FT) => any;
  irreversible: true;
}

export type MigrationDefinition<FT extends FieldTypes> =
  | ChangeMigrationDefinition<FT>
  | UpDownMigrationDefinition<FT>
  | IrreversibleMigrationDefinition<FT>;

export function createMigration<DBAdapter extends Adapter>(
  db: Database<DBAdapter>,
  definition: MigrationDefinition<DBAdapter['FieldTypes']>,
): Migration {
  return new Migration();
}
