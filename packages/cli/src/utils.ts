import fs from 'fs';
import mkdirp from 'mkdirp';
import path from 'path';
import execa from 'execa';
import ejs from 'ejs';
import { promisify } from 'util';
import enquirer from 'enquirer';
import config from './config';

const cwd = process.cwd();

const statAsync = promisify(fs.stat);
const writeFileAsync = promisify(fs.writeFile);
const mkdirpAsync = promisify(mkdirp);

async function hasFileOrDir(filename: string) {
  try {
    await statAsync(path.join(cwd, filename));
    return true;
  } catch (e) {
    return false;
  }
}

const isProject = () => hasFileOrDir('package.json');
const isTSProject = () => hasFileOrDir('tsconfig.json');

export async function ensureProject(
  warn: (message: string) => void,
  error: (message: string, config: object) => void,
) {
  if (!(await isProject())) {
    error(
      'We were not able to resolve the current project. Ensure that you are in a directory containing a "package.json" file and try again.',
      { exit: 1 },
    );
  }

  // TODO: Add flags on the command to optionally validate this stuff.
  if (!(await hasFileOrDir(config.src))) {
    error(
      `We were not able to find the source directory "${
        config.src
      }". You can use the "src" parameter in your Fewer configuration file to tell the CLI where your source files are located.`,
      { exit: 1 },
    );
  }

  if (config.typescript) {
    if (!(await isTSProject())) {
      warn(
        'We did not detect a TypeScript configuration file (tsconfig.json). TypeScript is recommend.',
      );

      const confirm = await prompt({
        type: 'confirm',
        message: 'Would you like to continue without TypeScript?',
      });

      if (!confirm) {
        error(
          'Re-run `fewer init` once your have initialized TypeScript in your project.',
          { exit: 1 },
        );
      }
    }
  }
}

export function hasDependency(dep: string) {
  const pkg = require(path.join(cwd, 'package.json'));
  return !!pkg.dependencies[dep] || !!pkg.devDependencies[dep];
}

export async function npmInstall(...packages: string[]) {
  await execa('npm', ['install', ...packages]);
}

export async function prompt(options: {
  type: string;
  message: string;
  choices?: string[];
  default?: string | boolean;
}) {
  try {
    const responses = await enquirer.prompt({
      name: 'question',
      ...options,
    });

    return Object.values(responses)[0];
  } catch (e) {
    process.exit(1);
  }
}

export async function createDirectory(directory: string) {
  await mkdirpAsync(path.join(cwd, directory));
}

export async function createFileWithContents(
  fileName: string,
  contents: string,
) {
  await writeFileAsync(path.join(cwd, fileName), contents);
}

export async function createFile(
  template: string,
  fileName: string,
  data: object,
) {
  const fileContents = await ejs.renderFile(
    path.join(__dirname, '..', 'templates', `${template}.ejs`),
    data,
    { async: true },
  );
  await writeFileAsync(path.join(cwd, fileName), fileContents);
}
