export interface Migration {
  up: string[];
  down?: string[];
}

interface ChangeMigrationDefinition<T> {
  change: (m: Pick<T, Exclude<keyof T, 'rawsql'>>) => void;
}

interface UpDownMigrationDefinition<T> {
  up: (m: T) => void;
  down: (m: T) => void;
}

interface IrreversibleMigrationDefinition<T> {
  up: (m: T) => void;
  irreversible: true;
}

export type MigrationDefinition<T> = ChangeMigrationDefinition<T> | UpDownMigrationDefinition<T> | IrreversibleMigrationDefinition<T>;

export function isChangeMigration<T>(definition: MigrationDefinition<T>): definition is ChangeMigrationDefinition<T> {
  return (<ChangeMigrationDefinition<T>>definition).change !== undefined;
}

export function isIrreversibleMigration<T>(definition: MigrationDefinition<T>): definition is IrreversibleMigrationDefinition<T> {
  return (<IrreversibleMigrationDefinition<T>>definition).irreversible === true;
}