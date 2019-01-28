import { INTERNAL_TYPES } from './types';

export interface BaseConfig {
  nonNull?: boolean;
}

export default class FieldType<T = any, Config extends BaseConfig = any> {
  readonly [INTERNAL_TYPES.INTERNAL_TYPE]: T;
  // Stash the type publically so that adapters can easily consume it as well:
  $$type!: T;

  name: string;
  config?: Config;

  constructor(name: string, config?: any) {
    this.name = name;
    this.config = config;
  }
}
