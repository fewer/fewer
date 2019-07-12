import { Command, flags } from '@oclif/command';
import commonFlags from '../../commonFlags';
import MigrationRunner from '../../MigrationRunner';
import { getMigrations, getDatabase } from '../../utils';

export default class Migrate extends Command {
  static description = 'Performs migrations.';

  static examples = [
    '$ fewer db:migrate',
    '$ fewer db:migrate --version 20190121190432',
    '$ fewer db:migrate --direction down --version 20190121190432',
    '$ fewer db:migrate --rollback',
    '$ fewer db:migrate --rollback --steps 3',
    '$ fewer db:migrate --redo --steps 3',
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

    const dbFile = await getDatabase('Which database would you like to perform migrations on?');
    const migrations = await getMigrations(dbFile);

    const runner = new MigrationRunner(migrations);

    try {
      if (flags.redo) {
        await runner.redo(dbFile, flags.steps);
      } else if (flags.version) {
        if (flags.direction === 'down') {
          await runner.down(flags.version!);
        } else {
          await runner.up(flags.version!);
        }
      } else if (flags.rollback) {
        await runner.rollback(dbFile, flags.steps);
      } else {
        await runner.latest(dbFile);
      }
    } finally {
      await runner.cleanup();
    }
  }
}
