import { INTERNAL_TYPES } from './types';

export default class FieldType<T = any> {
  readonly [INTERNAL_TYPES.INTERNAL_TYPE]: T;

  // Stash the type publically so that adapters can easily consume it as well:
  $$type!: T;

  name: string;
  config?: any;

  constructor(name: string, config?: any) {
    this.name = name;
    this.config = config;
  }
}
