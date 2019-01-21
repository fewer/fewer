import path from 'path';
import cli from 'cli-ux';
import { Command, flags } from '@oclif/command';
import { npmInstall, createFile } from '../../utils';
import commonFlags from '../../commonFlags';
import config from '../../config';

export default class GenerateDatabase extends Command {
  static description = 'Generates a new database file.';

  static examples = [
    '$ fewer generate:database myDatabase',
    '$ fewer generate:database myDatabase --adapter=mysql',
  ];

  static flags = {
    ...commonFlags,
    adapter: flags.string({
      char: 'v',
      default: 'postgres',
      options: ['postgres'],
      description:
        'The Database adapter to generate use with the database. The CLI will attempt to install the adapter before creating the file.',
      required: true,
    }),
  };

  static args = [
    {
      name: 'name',
      required: true,
      description:
        'The name of the file for the database that will be created.',
    },
  ];

  async run() {
    const { flags, args } = this.parse(GenerateDatabase);

    cli.action.start('Installing adapter');
    await npmInstall(`@fewer/adapter-${flags.adapter}`);
    cli.action.stop();

    cli.action.start('Creating files');
    const extension = config.typescript ? 'ts' : 'js';
    await createFile(
      config.cjs ? 'db.cjs' : 'db',
      path.join(config.src, `${args.name}.${extension}`),
      {
        adapter: flags.adapter,
      },
    );
    cli.action.stop();
  }
}
