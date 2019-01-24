import path from 'path';
import { Migration, Database, Adapter } from 'fewer';
import getConfig from './getConfig';
import { prompt } from './utils';

export default class MigrationRunner {
  private migrations: string[];
  private connectionPool: Set<Adapter>;

  constructor(migrations: string[]) {
    this.migrations = migrations;
    this.connectionPool = new Set();

    // Include the TS transpiler to allow TS syntax inside of migration files:
    require('ts-node/register/transpile-only');
  }

  private async ensureAdapterConnecter(adapter: Adapter) {
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

  private loadMigration(migrationFile: string): Migration {
    const migration = require(migrationFile);

    return migration.default || migration;
  }

  private loadDatabase(dbFile: string): Database {
    const dbModule = require(path.join(process.cwd(), dbFile));

    return dbModule.default || dbModule;
  }

  async redo(steps = 1) {
    const config = await getConfig();
    let dbFile = config.databases[0];
    if (config.databases.length > 1) {
      dbFile = await prompt({
        type: 'select',
        message: 'Which Database would you like to rollback?',
        choices: config.databases,
      });
    }

    const database = this.loadDatabase(dbFile);
    await this.ensureAdapterConnecter(database.adapter);

    const versions = await database.adapter.migrateGetVersions();

    // TODO: We should just have the hook return a sorted list of verisons, rather than having to do the property access here:
    const migrationsToRun = versions
      .slice(-1 * steps)
      .map(({ version }: any) => this.resolveVersion(version));

    for (const migration of migrationsToRun) {
      await this.run('down', migration);
    }

    for (const migration of [...migrationsToRun].reverse()) {
      await this.run('up', migration);
    }
  }

  async rollback(steps = 1) {
    const config = await getConfig();
    let dbFile = config.databases[0];
    if (config.databases.length > 1) {
      dbFile = await prompt({
        type: 'select',
        message: 'Which Database would you like to rollback?',
        choices: config.databases,
      });
    }

    const database = this.loadDatabase(dbFile);
    await this.ensureAdapterConnecter(database.adapter);

    const versions = await database.adapter.migrateGetVersions();
    // TODO: We should just have the hook return a sorted list of verisons, rather than having to do the property access here:
    const migrationsToRun = versions
      .slice(-1 * steps)
      .map(({ version }: any) => this.resolveVersion(version));

    for (const migration of migrationsToRun) {
      await this.run('down', migration);
    }
  }

  async up(version: string) {
    await this.run('up', this.resolveVersion(version));
  }

  async down(version: string) {
    await this.run('down', this.resolveVersion(version));
  }

  async latest() {
    const config = await getConfig();
    for (const dbFile of config.databases) {
      const database = this.loadDatabase(dbFile);
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
