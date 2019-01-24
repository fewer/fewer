type Undefined<T> = T extends undefined ? undefined : never;

type UndefinedProperties<T> = {
  [K in keyof T]: Undefined<T[K]> extends never ? never : K
}[keyof T];

type NotUndefinedProperties<T> = {
  [K in keyof T]: Undefined<T[K]> extends never ? K : never
}[keyof T];

// This is just a step that makes vscode collapse the type def:
type Merge<T extends object> = { [K in keyof T]: T[K] };

export type WithUndefinedPropertiesAsOptionals<T> = Merge<
  { [K in keyof T & UndefinedProperties<T>]?: Exclude<T[K], undefined> } &
    { [K in keyof T & NotUndefinedProperties<T>]: T[K] }
>;
