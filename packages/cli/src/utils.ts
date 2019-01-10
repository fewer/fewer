import fs, { writeFile } from 'fs';
import path from 'path';
import execa from 'execa';
import ejs from 'ejs';
import { promisify } from 'util';
import enquirer from 'enquirer';

const cwd = process.cwd();
const statAsync = promisify(fs.stat);
const writeFileAsync = promisify(fs.writeFile);

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
  flags: {
    js: boolean;
    src: string;
  },
  warn: (message: string) => void,
  error: (message: string, config: object) => void,
) {
  let useTypeScript = !flags.js;

  if (!(await isProject())) {
    error(
      'We were not able to resolve the current project. Ensure that you are in a directory containing a "package.json" file and try again.',
      { exit: 1 },
    );
  }

  if (!(await hasFileOrDir(flags.src))) {
    error(
      `We were not able to find the source directory "${
        flags.src
      }". You can use the --src flag to tell the CLI where your source files are located.`,
      { exit: 1 },
    );
  }

  if (!flags.js) {
    if (!(await isTSProject())) {
      useTypeScript = false;

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

  return useTypeScript;
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

export async function createFile(
  template: string,
  fileName: string,
  data: object,
) {
  const fileContents = await ejs.renderFile(
    path.join(__dirname, '..', 'templates', `${template}.hbs`),
    data,
    { async: true },
  );
  await writeFileAsync(path.join(cwd, fileName), fileContents);
}
