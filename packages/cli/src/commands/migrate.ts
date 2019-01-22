import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { Command, flags } from '@oclif/command';
import sortBy from 'lodash/sortBy';
import takeWhile from 'lodash/takeWhile';
import commonFlags from '../commonFlags';
import getConfig from '../getConfig';
import MigrationRunner from '../migrationRunner/Class';

const readdirAsync = promisify(fs.readdir);

export default class Migrate extends Command {
  static description = 'Performs migrations.';

  static examples = [
    '$ fewer migrate',
    '$ fewer migrate --version 20190121190432',
    '$ fewer migrate --direction down --version 20190121190432',
    '$ fewer migrate --rollback',
    '$ fewer migrate --rollback --steps 3',
    '$ fewer migrate --redo --steps 3',
  ];

  static flags = {
    ...commonFlags,
    version: flags.string({
      char: 'v',
      description: 'Runs a specific migration that matches the version.',
    }),
    rollback: flags.boolean({
      description: 'Rolls back the previous migration.',
      exclusive: ['version'],
    }),
    redo: flags.boolean({
      description: 'Roll back a number of migrations, then perform them again.',
      exclusive: ['version'],
    }),
    steps: flags.integer({
      description: 'Sets the number of migrations to rollback, or redo.',
      dependsOn: ['rollback', 'redo'],
    }),
    direction: flags.string({
      description: 'Runs a specific migration in the provided direction.',
      options: ['up', 'down'],
      dependsOn: ['version'],
      exclusive: ['rollback', 'redo', 'steps'],
    }),
  };

  // TODO: Move more of this into the migration runner.
  async run() {
    const { flags } = this.parse(Migrate);
    const config = await getConfig();

    // TODO: Store project root somewhere so that I don't need to do cwd garbage:
    const migrationFiles = await readdirAsync(
      path.resolve(process.cwd(), config.migrations),
    );

    const migrations = sortBy(
      migrationFiles.filter(filename => !filename.startsWith('.')),
    ).map(filename => path.join(process.cwd(), config.migrations, filename));

    const runner = new MigrationRunner(migrations);

    if (flags.redo) {
      runner.redo(flags.steps);
    } else if (flags.version) {
      if (flags.direction === 'down') {
        runner.down(flags.version!);
      } else {
        runner.up(flags.version!);
      }
    } else if (flags.rollback) {
      runner.rollback(flags.steps);
    } else {
      runner.latest();
    }

    await runner.go();
  }
}
