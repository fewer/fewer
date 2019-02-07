import Builder from './Builder';

interface Context {
  table: string;
  columns: object;
  primaryKey: [string, string | number];
}

export default class Update extends Builder<Context> {
  primaryKey(id: string, value: string | number) {
    return this.next({ primaryKey: [id, value] });
  }

  set(columns: object) {
    return this.next({ columns: { ...this.context.columns, ...columns } });
  }
}
