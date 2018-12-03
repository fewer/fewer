type Diff<T, U> = T extends U ? never : T;
type Undefined<T> =
  T extends undefined ? undefined :
  never
type NotUndefinedProperties<T> = { [K in keyof T]: Undefined<T[K]> extends never ? K : never }[keyof T];
type UndefinedPropertyNames<T> = Diff<keyof T, NotUndefinedProperties<T>>
type UndefinedProperties<T> = Pick<T, UndefinedPropertyNames<T>>
type WithoutUndefined<T> = {
  [P in keyof T]: Exclude<T[P], undefined>
}
type UndefinedPropertiesAsOptionals<T> = Partial<WithoutUndefined<UndefinedProperties<T>>>

// Finally...
export type WithUndefinedPropertiesAsOptionals<T> = Pick<T, NotUndefinedProperties<T>> & UndefinedPropertiesAsOptionals<T>
