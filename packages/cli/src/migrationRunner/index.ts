import { Migration } from 'fewer';

async function runMigration(direction: 'up' | 'down', migration: Migration) {
  try {
    await migration.database.connect();
    await migration.run(direction);
  } finally {
    await migration.database.disconnect();
  }
}

export default async function(direction: 'up' | 'down', migrations: string[]) {
  // Include the TS transpiler to allow TS syntax inside of migration files:
  require('ts-node/register/transpile-only');

  for (const migrationFile of migrations) {
    const migration = require(migrationFile);

    if (migration.default) {
      await runMigration(direction, migration.default);
    } else {
      await runMigration(direction, migration);
    }
  }
}
