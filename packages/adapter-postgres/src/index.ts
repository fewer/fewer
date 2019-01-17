import { Adapter as BaseAdapter } from 'fewer';
import { Insert, Select, Update } from '@fewer/sq';
import { Client, ConnectionConfig } from 'pg';
import squel from 'squel';
import FieldTypes from './FieldTypes';

const postgresSquel = squel.useFlavour('postgres');

class PostgresAdapter implements BaseAdapter {
  private client: Client;

  // Expose the Field Types:
  FieldTypes = FieldTypes;

  constructor(options: ConnectionConfig) {
    this.client = new Client(options);
  }

  connect() {
    return this.client.connect();
  }

  disconnect() {
    return this.client.end();
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
    const insert = postgresSquel
      .insert()
      .into(context.table)
      .setFields(context.fields)
      .returning('id');

    const results = await this.client.query(insert.toString());
    return results.rows;
  }

  async update(query: Update) {
    const context = query.get();
    const update = postgresSquel
      .update()
      .table(context.table)
      .setFields(context.fields);

    const results = await this.client.query(update.toString());
    return results.rows;
  }

  async rawQuery(query: string) {
    const results = await this.client.query(query);
    return results.rows;
  }
}

export { PostgresAdapter as Adapter };
