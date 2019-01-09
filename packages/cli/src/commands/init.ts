import { Command, flags } from '@oclif/command';
import { prompt } from 'enquirer';
import cli from 'cli-ux';
import { isProject, isTSProject, ensureProject, hasDependency, npmInstall } from '../utils';

export default class Hello extends Command {
  static description = 'Initializes fewer into an existing project';

  static flags = {
    help: flags.help({ char: 'h' }),
    name: flags.string({ char: 'n', description: 'name to print' }),
  };

  static args = [{ name: 'file' }];

  async run() {
    const { args, flags } = this.parse(Hello);

    const useTypeScript = await ensureProject(this.warn, this.error);

    const { adapter } = await prompt({
      type: 'select',
      name: 'adapter',
      message: 'Which database will you be connecting to?',
      choices: ['Postgres', 'MySQL']
    });

    cli.action.start('Installing npm dependencies')
    await npmInstall('fewer', `@fewer/adapter-${adapter.toLowerCase()}`);
    cli.action.stop();
  }
}
