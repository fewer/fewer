import path from 'path';
import { Command, flags } from '@oclif/command';
import { Database, Migration } from 'fewer';
import commonFlags from '../../commonFlags';
import getConfig from '../../getConfig';
import { createFile, resolve, getMigrations, prompt, getDatabase } from '../../utils';

export default class GenerateSchema extends Command {
  static description =
    'Re-generates the schema file for a given database. By default, this is performed offline by reducing the migration files into a single schema.';

  static flags = {
    ...commonFlags,
    online: flags.boolean({
      description:
        'Re-generates the schema file based on the current state of the database.',
    }),
    // TODO: Support generating offline schema to a specific version:
    // version: flags.integer({
    //   char: 'v',
    //   description:
    //     'Generate schema based on migrations up to, and including, the specified version.',
    //   exclusive: ['online'],
    // }),
  };

  async run() {
    const { flags } = this.parse(GenerateSchema);

    const config = await getConfig();

    // Include the TS transpiler to allow TS syntax inside of migration files:
    require('ts-node/register/transpile-only');

    const dbFile = await getDatabase();

    let tables: any[] = [];

    let version;
    if (flags.online) {
      const dbModule = require(path.join(process.cwd(), dbFile));
      const database: Database = dbModule.default || dbModule;

      await database.connect();

      const migratedVersion = await database.adapter.migrateGetVersions();
      version = migratedVersion.slice(-1)[0];

      const infos = await database.adapter.getInfos();

      Object.keys(infos).forEach(key => {
        tables.push({
          name: key,
          columns: infos[key].columns,
        });
      });

      await database.disconnect();
    } else {
      let tableMap: any = {};
      const migrations = await getMigrations(dbFile);
      for (const migrationFile of migrations) {
        const migrationModule = require(migrationFile);
        const migration: Migration = migrationModule.default || migrationModule;
        migration.prepare('up');
        migration.operations.forEach(operation => {
          if (operation.type === 'createTable') {
            tableMap[operation.name] = {
              name: operation.name,
              columns: Object.entries(operation.columns).map(
                ([key, value]) => ({
                  name: key,
                  method: value.reflectName,
                  arguments: [value.config],
                }),
              ),
            };
          } else if (operation.type === 'dropTable') {
            delete tableMap[operation.name];
          }
        });
        version = migration.version;
      }
      tables = Object.values(tableMap);
    }

    createFile(
      'schema',
      config.databases[dbFile].schema,
      {
        dbImport: path.basename(dbFile, path.extname(dbFile)),
        version,
        tables,
      },
      config.cjs,
    );
  }
}
