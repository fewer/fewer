import { Adapter as BaseAdapter } from 'fewer';
import mysql, { Connection, ConnectionConfig } from 'mysql';
import squel from 'squel';
import { Insert, Select, Update } from '@fewer/sq';

const mysqlSquel = squel.useFlavour('mysql');

export class MySQLAdapter implements BaseAdapter {
  private connection: Connection;

  constructor(options: ConnectionConfig) {
    this.connection = mysql.createConnection(options);
  }

  connect() {
    return new Promise<void>((resolve, reject) => {
      this.connection.connect(err => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async select(query: Select) {
    const context = query.get();
    const select = mysqlSquel.select().from(context.table);

    if (context.limit) {
      select.limit(context.limit);
    }

    if (context.offset) {
      select.offset(context.offset);
    }

    for (const field of context.plucked) {
      if (Array.isArray(field)) {
        select.field(...field);
      } else {
        select.field(field);
      }
    }

    for (const where of context.wheres) {
      for (const [fieldName, matcher] of Object.entries(where)) {
        if (Array.isArray(matcher)) {
          select.where(`${fieldName} IN ?`, matcher);
        } else {
          select.where(`${fieldName} = ?`, matcher);
        }
      }
    }

    const results = await this.query(select.toString());
    return results;
  }

  async insert(query: Insert) {
    const context = query.get();
    const insert = mysqlSquel.insert().into(context.table);
    const selectId = mysqlSquel.select().field('LAST_INSERT_ID()');

    insert.setFields(context.fields);

    const results = await this.query(
      [insert.toString(), selectId.toString()].join('; '),
    );

    return results;
  }

  async update(query: Update) {
    const context = query.get();
    const update = mysqlSquel
      .update()
      .table(context.table)
      .setFields(context.fields);

    const results = await this.query(update.toString());
    return results;
  }

  private query(queryString: string) {
    return new Promise<any[]>((resolve, reject) => {
      this.connection.query(queryString, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
  }
}
