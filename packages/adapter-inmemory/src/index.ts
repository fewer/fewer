import { Adapter as BaseAdapter } from 'fewer';
import sql from 'sql.js';
import squel from 'squel';
import { Insert, Select, Update } from '@fewer/sq';

// Fix handling of boolean values:
squel.registerValueHandler('boolean', val => (val ? '1' : '0'));

export class InMemoryAdapter implements BaseAdapter {
  private db: sql.Database;

  constructor() {
    this.db = new sql.Database();
  }

  connect() {
    return Promise.resolve();
  }

  async select(query: Select) {
    const context = query.get();
    const select = squel.select().from(context.table);

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

    return this.query(select.toString());
  }

  async insert(query: Insert) {
    const context = query.get();
    const insert = squel.insert().into(context.table);
    const selectId = squel.select().field('last_insert_rowid()');

    insert.setFields(context.fields);

    const [result] = this.db.exec(
      [insert.toString(), selectId.toString()].join('; '),
    );

    // Return the last inserted ID:
    return result.values[0][0];
  }

  async update(query: Update) {
    const context = query.get();
    const update = squel
      .update()
      .table(context.table)
      .setFields(context.fields);

    const results = await this.query(update.toString());
    return results;
  }

  private query(queryString: string) {
    const [result] = this.db.exec(queryString);

    if (!result) return [];

    return result.values.map(value => {
      const obj: any = {};

      result.columns.forEach((colName, i) => {
        obj[colName] = value[i];
      });

      return obj;
    });
  }
}
