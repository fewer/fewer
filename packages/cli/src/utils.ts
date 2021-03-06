import fs from 'fs';
import mkdirp from 'mkdirp';
import path from 'path';
import execa from 'execa';
import ejs from 'ejs';
import { promisify } from 'util';
import enquirer from 'enquirer';
import prettier from 'prettier';
import sortBy from 'lodash/sortBy';
import getConfig from './getConfig';

const cwd = process.cwd();

const statAsync = promisify(fs.stat);
const writeFileAsync = promisify(fs.writeFile);
const mkdirpAsync = promisify(mkdirp);
const readdirAsync = promisify(fs.readdir);

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
  const config = await getConfig();

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

export async function installPackages(warn: Function, ...packages: string[]) {
  const manager = await prompt({
    type: 'select',
    message: 'Which package manager should be used to install new dependencies?',
    choices: ['npm', 'yarn', 'skip dependencies'],
  });

  if (manager === 'npm') {
    await execa('npm', ['install', ...packages]);
  } else if (manager === 'yarn') {
    await execa('yarn', ['add', ...packages]);
  } else {
    warn(`The following dependencies are required to run, but were not installed: ${packages.join(', ')}`);
  }
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
  cjs?: boolean,
) {
  let fileContents = await ejs.renderFile<string>(
    path.join(__dirname, '..', 'templates', `${template}.ejs`),
    data,
    { async: true },
  );

  if (cjs) {
    fileContents = toCJS(fileContents);
  }

  const outputFilePath = path.join(cwd, fileName);
  const prettierConfig = await prettier.resolveConfig(outputFilePath);

  await writeFileAsync(
    outputFilePath,
    prettier.format(fileContents, {
      filepath: outputFilePath,
      ...prettierConfig,
    }),
  );
}

export async function getMigrations() {
  const config = await getConfig();

  // TODO: Store project root somewhere (read-pkg-up?) so that I don't need to do cwd garbage:
  const migrationFiles = await readdirAsync(
    path.resolve(cwd, config.migrations),
  );

  return sortBy(
    migrationFiles.filter(filename => !filename.startsWith('.')),
  ).map(filename => path.join(cwd, config.migrations, filename));
}

export function resolve(from: string, to: string) {
  const relativePath = path.relative(
    path.dirname(from),
    path.join(path.dirname(to), path.basename(to, path.extname(to))),
  );

  if (!relativePath.startsWith('.')) {
    return `./${relativePath}`;
  }

  return relativePath;
}

// A quick-and-dirty way to convert a file to from ESM to CJS. This is intentionally
// not perfect, and only is designed to work with the templates included here.
export function toCJS(contents: string) {
  return contents
    .replace('export default', 'module.exports =')
    .replace(/import (.*?) from (.*?);/g, 'const $1 = require($2);');
}
