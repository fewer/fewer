import path from 'path';
import cli from 'cli-ux';
import { Command } from '@oclif/command';
import { ensureProject, npmInstall, createFile, prompt } from '../../utils';

export default class Generate extends Command {
  static description =
    'Used to scaffold new databases, migrations, and repositories into existing Fewer projects.';
  static usage = 'generate --help';

  static examples = [
    '$ fewer generate:database --help',
    '$ fewer generate:repository --help',
    '$ fewer generate:migration --help',
    '$ fewer generate:schema --help',
  ];

  async run() {
    this._help();
  }
}
