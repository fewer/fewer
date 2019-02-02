import path from 'path';
import { Command, flags } from '@oclif/command';
import { Database, Migration } from 'fewer';
import commonFlags from '../../commonFlags';
import getConfig from '../../getConfig';
import { createFile, resolve, getMigrations } from '../../utils';

export default class GenerateSchema extends Command {
  static description =
    'Re-generates the schema file based on the current state of the database.';

  static flags = {
    ...commonFlags,
    offline: flags.boolean({
      description: '',
    }),
    // TODO: Support generating offline schema to a specific version:
    // version: flags.integer({
    //   char: 'v',
    //   description:
    //     'Generate schema based on migrations up to, and including, the specified version.',
    //   dependsOn: ['offline'],
    // }),
  };

  async run() {
    const { flags } = this.parse(GenerateSchema);

    const config = await getConfig();

    // Include the TS transpiler to allow TS syntax inside of migration files:
    require('ts-node/register/transpile-only');

    const databases = config.databases.map(dbFile => ({
      module: require(path.join(process.cwd(), dbFile)),
      ident: resolve(config.schema, dbFile),
      // TODO: Dedupe to ensure we don't have multiple of these:
      importName: path.basename(dbFile, path.extname(dbFile)),
    }));

    let tables: any[] = [];

    if (flags.offline) {
      let tableMap: any = {};
      const migrations = await getMigrations();
      for (const migrationFile of migrations) {
        const migrationModule = require(migrationFile);
        const migration: Migration = migrationModule.default || migrationModule;
        migration.operations.forEach(operation => {
          if (operation.type === 'createTable') {
            tableMap[operation.name] = {
              name: operation.name,
              database: databases.find(
                db =>
                  db.module === migration.database ||
                  db.module.default === migration.database,
              ),
              columns: [],
            };
          } else if (operation.type === 'dropTable') {
            delete tableMap[operation.name];
          }
        });
      }
      tables = Object.values(tableMap);
    } else {
      for (const db of databases) {
        const database: Database = db.module.default || db.module;

        await database.connect();
        const infos = await database.adapter.getInfos();

        Object.keys(infos).forEach(key => {
          tables.push({
            name: key,
            database: db,
            columns: infos[key].columns,
          });
        });

        await database.disconnect();
      }
    }

    createFile(
      'schema',
      config.schema,
      {
        databases,
        tables,
      },
      config.cjs,
    );
  }
}
