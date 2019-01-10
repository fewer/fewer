import Builder from './Builder';

interface Context {
  table: string;
  fields: object;
}

export default class Insert extends Builder<Context> {
  set(fields: object) {
    return this.next({ fields: { ...this.context.fields, ...fields } });
  }
}
