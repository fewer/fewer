import { Adapter as BaseAdapter } from 'fewer';
import { Client, ConnectionConfig } from 'pg';
import squel from 'squel';
import { Insert, Select } from '@fewer/sq';

const postgresSquel = squel.useFlavour('postgres');

export class PostgresAdapter implements BaseAdapter {
  private client: Client;

  constructor(options: ConnectionConfig) {
    this.client = new Client(options);
  }

  connect() {
    return this.client.connect();
  }

  async select(query: Select) {
    const context = query.get();
    const select = postgresSquel.select().from(context.table);

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

    const results = await this.client.query(select.toString());
    return results.rows;
  }

  async insert(query: Insert) {
    const context = query.get();
    const insert = postgresSquel.insert().into(context.table);

    insert.setFields(context.fields).returning('id');

    const results = await this.client.query(insert.toString());
    return results.rows;
  }
}
