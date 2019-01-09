import { Adapter as BaseAdapter } from 'fewer';
import JsStore from 'jsstore';
import SqlString from 'sqlstring';

export class MySQLAdapter implements BaseAdapter {
  private connection: JsStore.Instance;

  constructor() {
    this.connection = new JsStore.Instance();
  }

  connect() {
    return Promise.resolve();
  }

  query(queryString: string, values?: any[]) {
    return this.connection.runSql(
      values ? SqlString.format(queryString, values) : queryString,
    );
  }
}
