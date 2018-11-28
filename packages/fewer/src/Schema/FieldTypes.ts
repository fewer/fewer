export class Type<T> {
  $$Type!: T;
  constructor(config?: object) {
    // TODO:
  }
}

function type<T>(name: string) {
  return (config?: object) => new Type<T>(config);
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
