import { createDatabase, createAdapter, ColumnType } from '..';

const columnTypes = {
  string: () => new ColumnType<string>('string'),
  number: () => new ColumnType<number>('number'),
  maybeString: () => new ColumnType<string | undefined>('maybeString'),
  maybeNumber: () => new ColumnType<number | undefined>('maybeNumber'),
  required: <T>() => new ColumnType<T>('requiredGenericType'),
  maybe: <T>() => new ColumnType<T | undefined>('maybeGenericType'),
};

interface TableTypes {
  handlesOptions?: boolean;
  primaryKey: string;
}

type ColumnTypes = typeof columnTypes;

export const Adapter = createAdapter<TableTypes, ColumnTypes, any, any>({
  columnTypes,
  async connect() {},
  async disconnect() {},
  async migrate() {},
  async select() {
    return [];
  },
  async insert() {
    return null;
  },
  async update() {
    return null;
  },
  async migrateAddVersion() {},
  async migrateGetVersions() {
    return [];
  },
  async migrateHasVersion() {
    return true;
  },
  async migrateRemoveVersion() {},
});

export const adapter = new Adapter({});
export const database = createDatabase({
  adapter,
});
