import { Command } from '@oclif/command';

export default class Db extends Command {
  static description =
    'Used to perform database operations, and generate the schema.';
  static usage = 'db --help';

  static examples = [
    '$ fewer db:migrate --help',
    '$ fewer db:schema --help',
  ];

  async run() {
    this._help();
  }
}
