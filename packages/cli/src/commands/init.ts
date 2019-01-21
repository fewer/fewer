import path from 'path';
import cli from 'cli-ux';
import { Command } from '@oclif/command';
import {
  npmInstall,
  createFile,
  prompt,
  createDirectory,
  createFileWithContents,
} from '../utils';
import commonFlags from '../commonFlags';
import { FewerConfigurationFile } from '../getConfig';

export default class Init extends Command {
  static description = 'Initializes fewer into an existing project.';

  static flags = {
    ...commonFlags,
  };

  static args = [];

  async run() {
    const adapter = await prompt({
      type: 'select',
      message: 'Which database will you be connecting to?',
      choices: ['postgres', 'mysql'],
    });

    const src = await prompt({
      type: 'input',
      message: 'Where will your source files be located?',
      default: 'src',
    });

    const migrations = await prompt({
      type: 'input',
      message: 'Where would you like your migrations to be stored?',
      default: path.join(src, 'migrations/'),
    });

    const repositories = await prompt({
      type: 'input',
      message: 'Where would you like your repositories to be stored?',
      default: path.join(src, 'repositories/'),
    });

    const sourceType = await prompt({
      type: 'select',
      message: 'Will your project be written in TypeScript or JavaScript?',
      choices: ['TypeScript', 'JavaScript'],
      default: 'TypeScript',
    });

    const useTypeScript = sourceType === 'TypeScript';

    let cjs = false;
    if (!useTypeScript) {
      cjs = await prompt({
        type: 'select',
        message: 'Will your project use ES Modules, or CommonJS?',
        choices: ['ES Modules', 'CommonJS'],
        default: 'ES Modules',
      });
    }

    cli.action.start('Installing npm dependencies');
    await npmInstall('fewer', `@fewer/adapter-${adapter.toLowerCase()}`);
    cli.action.stop();

    cli.action.start('Creating files');
    const extension = useTypeScript ? 'ts' : 'js';
    await createFile(
      'db',
      path.join(src, `database.${extension}`),
      {
        adapter,
      },
      cjs
    );

    await createDirectory(migrations);
    await createDirectory(repositories);

    const fewerConfig: Partial<FewerConfigurationFile> = {
      src,
      migrations,
      repositories,
      databases: [path.join(src, `database.${extension}`)],
    };

    if (!useTypeScript) {
      fewerConfig.typescript = false;
    }

    if (cjs) {
      fewerConfig.cjs = true;
    }

    await createFileWithContents(
      '.fewerrc.json',
      JSON.stringify(fewerConfig, null, 2),
    );
    cli.action.stop();
  }
}
