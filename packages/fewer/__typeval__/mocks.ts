import {
  createDatabase,
  Adapter as BaseAdapter,
  FieldType,
} from '../src';

const FieldTypes = {
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

export class Adapter implements BaseAdapter {
  TableTypes!: TableTypes;
  FieldTypes = FieldTypes;
  async connect() {}
  async select() {
    return [];
  }
  async insert() {
    return null;
  }
  async update() {
    return null;
  }
}

export const adapter = new Adapter();
export const database = createDatabase({
  adapter,
});
