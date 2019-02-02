import { Command } from '@oclif/command';

export default class Generate extends Command {
  static description =
    'Used to scaffold new databases, migrations, and repositories into existing Fewer projects.';
  static usage = 'generate --help';

  static examples = [
    '$ fewer generate:database --help',
    '$ fewer generate:repository --help',
    '$ fewer generate:migration --help',
  ];

  async run() {
    this._help();
  }
}
