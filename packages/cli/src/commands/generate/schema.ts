import path from 'path';
import { Command } from '@oclif/command';
import { Database } from 'fewer';
import commonFlags from '../../commonFlags';
import getConfig from '../../getConfig';
import { createFile, resolve } from '../../utils';

export default class GenerateSchema extends Command {
  static description =
    'Re-generates the schema file based on the current state of the database.';

  static flags = {
    ...commonFlags,
    // TODO: Eventually it would be rad to support offline schema migration by reducing all of the migrations
    // into the single schema file. Until then we'll keep doing it online.
    // offline: flags.boolean({
    //   description: '',
    // }),
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

    const databases = config.databases
      .map(dbFile => ({
        module: require(path.join(process.cwd(), dbFile)),
        ident: resolve(config.schema, dbFile),
        // TODO: Dedupe to ensure we don't have multiple of these:
        importName: path.basename(dbFile, path.extname(dbFile)),
      }));

    const tables: any[] = [];

    for (const db of databases) {
      const database: Database = db.module.default || db.module;

      await database.connect();
      const infos = await database.adapter.getInfos();

      Object.keys(infos).forEach((key) => {
        tables.push({
          name: key,
          database: db,
          columns: infos[key].columns,
        });
      });

      await database.disconnect();
    }

    createFile('schema', config.schema, {
      databases,
      tables,
    }, config.cjs);
  }
}
