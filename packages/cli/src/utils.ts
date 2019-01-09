import fs from 'fs';
import path from 'path';
import execa from 'execa';
import { promisify } from 'util';
import { prompt } from 'enquirer';

const cwd = process.cwd();
const statAsync = promisify(fs.stat);

async function hasFile(filename: string) {
  try {
    await statAsync(path.join(cwd, filename));
    return true;
  } catch (e) {
    return false;
  }
}

export const isProject = () => hasFile('package.json');
export const isTSProject = () => hasFile('tsconfig.json');

export async function ensureProject(
  warn: (message: string) => void,
  error: (message: string, config: object) => void,
) {
  let useTypeScript = false;

  if (!(await isProject())) {
    error(
      'We were not able to resolve the current project. Ensure that you are in a directory containing a "package.json" file and try again.',
      { exit: 1 },
    );
  }

  if (!(await isTSProject())) {
    useTypeScript = false;

    warn(
      'We did not detect a TypeScript configuration file (tsconfig.json). TypeScript is recommend.',
    );

    const { confirm } = await prompt({
      type: 'confirm',
      name: 'confirm',
      message: 'Would you like to continue without TypeScript?',
    });

    if (!confirm) {
      error(
        'Re-run `fewer init` once your have initialized TypeScript in your project.',
        { exit: 1 },
      );
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
