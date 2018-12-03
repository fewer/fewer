type Diff<T, U> = T extends U ? never : T;
type IsUndefined<T> = T extends undefined ? true : false;
type NotUndefinedProperties<T> = {
  [K in keyof T]: IsUndefined<T[K]> extends true ? K : never
}[keyof T];
type UndefinedPropertyNames<T> = Diff<keyof T, NotUndefinedProperties<T>>;
type UndefinedProperties<T> = Pick<T, UndefinedPropertyNames<T>>;
type WithoutUndefined<T> = { [P in keyof T]: Exclude<T[P], undefined> };
type UndefinedPropertiesAsOptionals<T> = Partial<
  WithoutUndefined<UndefinedProperties<T>>
>;

// All to get this:
export type WithUndefinedPropertiesAsOptionals<T> = Pick<
  T,
  NotUndefinedProperties<T>
> &
  UndefinedPropertiesAsOptionals<T>;
