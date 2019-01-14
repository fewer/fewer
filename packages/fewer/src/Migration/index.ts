import { Database } from '../Database';

export class Migration {
  up: any;
  down: any;

  constructor() {
    this.up = 'up';
    this.down = 'down';
  }
}

// Default migration type is change migration:
type DefaultMigration<T> = (m: T) => void;

interface ChangeMigrationDefinition<T> {
  change: (m: T) => void;
}

interface UpDownMigrationDefinition<T> {
  up: (m: T) => void;
  down: (m: T) => void;
}

interface IrreversibleMigrationDefinition<T> {
  up: (m: T) => void;
  irreversible: true;
}

export type MigrationDefinition<T> =
  | DefaultMigration<T>
  | ChangeMigrationDefinition<T>
  | UpDownMigrationDefinition<T>
  | IrreversibleMigrationDefinition<T>;

export function createMigration(
  db: Database,
  definition: MigrationDefinition<any>,
) {
  return new Migration();
}
