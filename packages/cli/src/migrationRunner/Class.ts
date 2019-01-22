import { Migration } from 'fewer';

export default class MigrationRunner {
  migrations: string[];

  constructor(migrations: string[]) {
    this.migrations = migrations;

    // Include the TS transpiler to allow TS syntax inside of migration files:
    require('ts-node/register/transpile-only');
  }

  private async run(direction: 'up' | 'down', migration: Migration) {
    try {
      await migration.database.connect();
      await migration.run(direction);
    } finally {
      await migration.database.disconnect();
    }
  }

  // Prepares the runner to perform a given migration:
  redo(steps = 1) {}

  rollback(steps = 1) {}

  up(version: string) {}

  down(version: string) {}

  latest() {}

  // Performs the underlying migrations:
  async go() {

  }
}
