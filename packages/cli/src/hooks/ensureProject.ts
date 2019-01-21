import { Hook } from '@oclif/config';
import { ensureProject } from '../utils';

const hook: Hook<'prerun'> = async function(options) {
  try {
    await ensureProject(this.warn, this.error);
  } catch(e) {
    this.error(e.message, { exit: 1 });
  }
};

export default hook;
