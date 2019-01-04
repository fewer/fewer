import { INTERNAL_TYPE } from "../types";

export class Type<T = any, CanBeNull = true> {
  [INTERNAL_TYPE]: CanBeNull extends true ? T | undefined : T;

  constructor(config?: object) {
    // TODO:
  }
}

function type<T>(name: string) {
  return (config?: object) => new Type<T>(config);
}

export function nonNull<T extends Type>(type: T)  {
  type SubType = T extends Type<infer U> ? U : never;
  return new Type<SubType, false>();
}

// NUMBER TYPES:
export const integer = type<number>('integer');
export const smallint = type<number>('smallint');
export const bigint = type<number>('bigint');
export const int = integer;

export const decimal = type<number>('decimal');
export const numeric = type<number>('numeric');
export const float = type<number>('float');
export const double = type<number>('double');
export const bit = type<number>('bit');
export const boolean = type<boolean>('boolean');

// STRING TYPES:
export const varchar = type<string>('varchar');
export const char = type<string>('char');
export const binary = type<string>('binary');
export const varbinary = type<string>('varbinary');
export const blob = type<string>('blob');
export const text = type<string>('text');
export const string = varchar;

// DATE TYPES:
// TODO: ADD MORE:
export const datetime = type<string>('datetime');
