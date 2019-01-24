import { createDatabase, createAdapter, FieldType } from '../src';

const fieldTypes = {
  string: () => new FieldType<string>('string'),
  number: () => new FieldType<number>('number'),
  maybeString: () => new FieldType<string | undefined>('maybeString'),
  maybeNumber: () => new FieldType<number | undefined>('maybeNumber'),
  required: <T>() => new FieldType<T>('requiredGenericType'),
  maybe: <T>() => new FieldType<T | undefined>('maybeGenericType'),
};

interface TableTypes {
  handlesOptions?: boolean;
}

type FieldTypes = typeof fieldTypes;

export const Adapter = createAdapter<TableTypes, FieldTypes, any, any>({
  fieldTypes,
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
  async migrateGetVersions() {},
  async migrateHasVersion() {
    return true;
  },
  async migrateRemoveVersion() {},
});

export const adapter = new Adapter({});
export const database = createDatabase({
  adapter,
});
