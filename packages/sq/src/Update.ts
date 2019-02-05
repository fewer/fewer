import Builder from './Builder';

interface Context {
  table: string;
  fields: object;
  primaryKey: [string, string | number];
}

export default class Update extends Builder<Context> {
  primaryKey(id: string, value: string | number) {
    return this.next({ primaryKey: [id, value] });
  }

  set(fields: object) {
    return this.next({ fields: { ...this.context.fields, ...fields } });
  }
}
