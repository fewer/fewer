import path from 'path';
import { Command, flags } from '@oclif/command';
import commonFlags from '../../commonFlags';
import getConfig from '../../getConfig';
import { prompt, createFile } from '../../utils';

function pad(num: number) {
  return String(num).padStart(2, '0');
}

// Gets a UTC date formatted YYYYMMDDHHMMSS
function getMigrationTimestamp() {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = pad(now.getUTCMonth() + 1);
  const day = pad(now.getUTCDate());
  const hours = pad(now.getUTCHours());
  const minutes = pad(now.getUTCMinutes());
  const seconds = pad(now.getUTCSeconds());
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

export default class GenerateMigration extends Command {
  static description = 'Generates a migration that can be run.';

  static flags = {
    ...commonFlags,
  };

  static args = [
    {
      name: 'name',
      description: 'The name of the migration that will be generated.',
      required: true,
    },
  ];

  async run() {
    const { args } = this.parse(GenerateMigration);
    const config = await getConfig();

    if (!config.databases.length) {
      this.warn(
        'We did not find any configured databases in your Fewer configuration file.',
      );
    }
    let [database] = config.databases;
    if (config.databases.length > 1) {
      database = await prompt({
        type: 'select',
        message: 'Which database is this migration for?',
        choices: config.databases,
      });
    }

    const migrationFileName = path.join(
      config.migrations,
      `${getMigrationTimestamp()}_${args.name}.${
        config.typescript ? 'ts' : 'js'
      }`,
    );

    const databaseImportPath = path.relative(
      migrationFileName,
      path.join(
        path.dirname(database),
        path.basename(database, path.extname(database)),
      ),
    );

    createFile(
      'migration',
      migrationFileName,
      {
        database: databaseImportPath,
      },
      config.cjs,
    );
  }
}
