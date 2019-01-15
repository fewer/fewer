import { Hook } from '@oclif/config';
import { ensureProject } from '../utils';

const hook: Hook<'prerun'> = async function(options) {
  await ensureProject(this.warn, this.error);
};

export default hook;
