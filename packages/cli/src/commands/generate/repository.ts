import { Command } from '@oclif/command';
import commonFlags from '../../commonFlags';

export default class GenerateRepository extends Command {
  static description = 'Generates a new repository.';

  static flags = {
    ...commonFlags,
  };

  static args = [];

  async run() {
    throw new Error('Not yet implemented.');
  }
}
