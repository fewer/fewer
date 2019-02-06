import { createDatabase, createAdapter, FieldType, ExprType } from '../src';

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

type ExprTypeWithLiterals<T> = T extends ExprType<string> ? ExprType<string> | string : T;

const functions = {
  eq: <T>(left: ExprTypeWithLiterals<ExprType<T>>, right: ExprTypeWithLiterals<ExprType<T>>) => new ExprType<boolean>(),
  lower: <T>(input: ExprType<string>) => new ExprType<string>()
}

type FieldTypes = typeof fieldTypes;
type FunctionsType = typeof functions;

export const Adapter = createAdapter<TableTypes, FieldTypes, FunctionsType, any, any>({
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
