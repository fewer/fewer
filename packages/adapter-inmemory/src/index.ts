import { Adapter as BaseAdapter } from 'fewer';
import sql from 'sql.js';
import SqlString from 'sqlstring';

export class MySQLAdapter implements BaseAdapter {
  private db: sql.Database;

  constructor() {
    this.db = new sql.Database();
  }

  connect() {
    return Promise.resolve();
  }

  async query(queryString: string, values?: any[]) {
    const [result] = this.db.exec(
      values ? SqlString.format(queryString, values) : queryString,
    );

    return result.values.map(value => {
      const obj: any = {};

      result.columns.forEach((colName, i) => {
        obj[colName] = value[i];
      });

      return obj;
    });
  }
}
