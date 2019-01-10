import path from 'path';
import cli from 'cli-ux';
import { Command, flags } from '@oclif/command';
import { ensureProject, npmInstall, createFile, prompt } from '../utils';

export default class Hello extends Command {
  static description = 'Initializes fewer into an existing project';

  static flags = {
    help: flags.help({ char: 'h' }),
    js: flags.boolean({
      description: 'Force using JavaScript instead of TypeScript',
    }),
    cjs: flags.boolean({
      description: 'use CommonJS modules instead of standard ES modules',
    }),
    src: flags.string({
      required: true,
      default: 'src',
      description: 'the source directory where project files will be generated',
    }),
  };

  static args = [];

  async run() {
    const { flags } = this.parse(Hello);

    const useTypeScript = await ensureProject(flags, this.warn, this.error);

    const adapter = await prompt({
      type: 'select',
      message: 'Which database will you be connecting to?',
      choices: ['Postgres', 'MySQL'],
    });

    cli.action.start('Installing npm dependencies');
    await npmInstall('fewer', `@fewer/adapter-${adapter.toLowerCase()}`);
    cli.action.stop();

    cli.action.start('Creating files');
    const extension = useTypeScript ? 'ts' : 'js';
    await createFile(
      flags.cjs ? 'db.cjs' : 'db',
      path.join(flags.src, `db.${extension}`),
      {
        adapter,
      },
    );
    cli.action.stop();
  }
}
