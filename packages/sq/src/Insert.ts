import Builder from './Builder';

interface Context {
  table: string;
  columns: object;
  primaryKey: string;
}

export default class Insert extends Builder<Context> {
  set(columns: object) {
    return this.next({ columns: { ...this.context.columns, ...columns } });
  }

  primaryKey(pk: string) {
    return this.next({ primaryKey: pk });
  }
}
