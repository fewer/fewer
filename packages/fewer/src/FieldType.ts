import { INTERNAL_TYPES } from './types';

export default class Type<T = any, TypeConfig extends object = never> {
  [INTERNAL_TYPES.INTERNAL_TYPE]: T;

  name: string;
  config?: TypeConfig;

  constructor(name: string, config?: TypeConfig) {
    this.name = name;
    this.config = config;
  }
}
