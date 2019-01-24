import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { Command, flags } from '@oclif/command';
import sortBy from 'lodash/sortBy';
import commonFlags from '../commonFlags';
import getConfig from '../getConfig';
import MigrationRunner from '../MigrationRunner';

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
      exclusive: ['version'],
    }),
    direction: flags.string({
      description: 'Runs a specific migration in the provided direction.',
      options: ['up', 'down'],
      dependsOn: ['version'],
      exclusive: ['rollback', 'redo', 'steps'],
    }),
  };

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

    try {
      if (flags.redo) {
        await runner.redo(flags.steps);
      } else if (flags.version) {
        if (flags.direction === 'down') {
          await runner.down(flags.version!);
        } else {
          await runner.up(flags.version!);
        }
      } else if (flags.rollback) {
        await runner.rollback(flags.steps);
      } else {
        await runner.latest();
      }
    } finally {
      await runner.cleanup();
    }
  }
}
