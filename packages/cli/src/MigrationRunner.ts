import path from 'path';
import { Migration, Database, Adapter } from 'fewer';
import getConfig from './getConfig';

export default class MigrationRunner {
  private migrations: string[];
  private connectionPool: Set<Adapter>;

  constructor(migrations: string[]) {
    this.migrations = migrations;
    this.connectionPool = new Set();

    // Include the TS transpiler to allow TS syntax inside of migration files:
    require('ts-node/register/transpile-only');
  }

  // TODO: Once we have managed adapters, we can be way lazier about this:
  private async ensureAdapterConnecter(adapter: Adapter) {
    if (this.connectionPool.has(adapter)) {
      return;
    }
    this.connectionPool.add(adapter);
    await adapter.connect();
  }

  private async run(direction: 'up' | 'down', migration: Migration) {
    await this.ensureAdapterConnecter(migration.database.adapter);
    await migration.run(direction);
  }

  private resolveVersion(version: string) {
    const migrationFile = this.migrations.find(filename =>
      path.basename(filename).startsWith(version),
    );

    if (!migrationFile) {
      throw new Error(`No migration found for version "${version}"`);
    }

    return this.loadMigration(migrationFile);
  }

  private loadMigration(migrationFile: string) {
    const migration = require(migrationFile);

    return migration.default || migration;
  }

  redo(steps = 1) {}

  rollback(steps = 1) {}

  async up(version: string) {
    await this.run('up', this.resolveVersion(version));
  }

  async down(version: string) {
    await this.run('down', this.resolveVersion(version));
  }

  async latest() {
    const config = await getConfig();
    for (const dbFile of config.databases) {
      const dbModule = require(path.join(process.cwd(), dbFile));
      const database: Database = dbModule.default || dbModule;
      await this.ensureAdapterConnecter(database.adapter);
      const migratedVersions = await database.adapter.migrateGetVersions();
      const migrationsToRun = this.migrations.filter(
        filename =>
          !migratedVersions.some(({ version }: any) =>
            path.basename(filename).startsWith(version),
          ),
      );
      for (const migrationFile of migrationsToRun) {
        await this.run('up', this.loadMigration(migrationFile));
      }
    }
  }

  async cleanup() {
    await Promise.all(
      [...this.connectionPool].map(adapter => adapter.disconnect()),
    );
  }
}
