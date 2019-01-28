import path from 'path';
import { Command, flags } from '@oclif/command';
import { Database } from 'fewer';
import commonFlags from '../../commonFlags';
import offlineSchemaGenerator from '../../offlineSchemaGenerator';
import getConfig from '../../getConfig';

export default class GenerateSchema extends Command {
  static description =
    'Re-generates the schema file based on the migrations. ' +
    'This command iterates through all of the migrations, and generates the reduces all of them into a single schema. ' +
    'This is performed offline, and does not verify that the migrations have been run on the database.';

  static flags = {
    ...commonFlags,
    offline: flags.boolean({
      description: '',
    }),
    version: flags.integer({
      char: 'v',
      description:
        'Generate schema based on migrations up to, and including, the specified version.',
      dependsOn: ['offline'],
    }),
  };

  async run() {
    const { flags } = this.parse(GenerateSchema);

    if (flags.offline) {
      await offlineSchemaGenerator(flags.version);
      return;
    }

    const config = await getConfig();

    const databases: Database[] = config.databases
      .map(dbFile => require(path.join(process.cwd(), dbFile)))
      .map(db => db.default || db);

    for (const database of databases) {
      await database.connect();
      const infos = await database.adapter.getInfos();
      console.log(infos.users.columns.map((col) => col.arguments))
      await database.disconnect();
    }
  }
}
