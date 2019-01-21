import { Command, flags } from '@oclif/command';
import commonFlags from '../../commonFlags';

export default class GenerateSchema extends Command {
  static description =
    'Re-generates the schema file based on the migrations. ' +
    'This command iterates through all of the migrations, and generates the reduces all of them into a single schema. ' +
    'This is performed offline, and does not verify that the migrations have been run on the database.';

  static flags = {
    ...commonFlags,
    version: flags.integer({
      char: 'v',
      description:
        'Generate schema based on migrations up to, and including, the specified version.',
    }),
  };

  static args = [];

  async run() {
    const { flags } = this.parse(GenerateSchema);
  }
}
