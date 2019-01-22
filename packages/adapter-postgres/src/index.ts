import { createAdapter } from 'fewer';
import { Client, ConnectionConfig } from 'pg';
import squel from './squel';
import TableTypes from './TableTypes';
import migrate from './migrate';
import fieldTypes from './fieldTypes';

type FieldTypes = typeof fieldTypes;

async function rawQuery(db: Client, query: string, values?: any[]) {
  const results = await db.query(query, values);
  return results.rows;
}

async function ensureMigrationTable(db: Client) {
  await rawQuery(db, `CREATE TABLE IF NOT EXISTS _fewer_version (
    id bigserial PRIMARY KEY,
    version varchar UNIQUE
  )`);
}

export const Adapter = createAdapter<TableTypes, FieldTypes, ConnectionConfig, Client>({
  fieldTypes,

  async connect(options) {
    const client = new Client(options);
    await client.connect();
    return client;
  },

  async disconnect(db) {
    await db.end();
  },

  async select(db, context) {
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

    const results = await db.query(select.toString());
    return results.rows;
  },

  async insert(db, context) {
    const insert = squel
      .insert()
      .into(context.table)
      .setFields(context.fields)
      .returning('id');

    const results = await db.query(insert.toString());
    return results.rows;
  },

  async update(db, context) {
    const update = squel
      .update()
      .table(context.table)
      .setFields(context.fields);

    const results = await db.query(update.toString());
    return results.rows;
  },

  async migrateAddVersion(db, version) {
    await ensureMigrationTable(db);
    await rawQuery(db, 'INSERT INTO _fewer_version (version) VALUES ($1)', [
      version,
    ]);
  },

  async migrateRemoveVersion(db, version) {
    await ensureMigrationTable(db);
    await rawQuery(db, 'DELETE FROM _fewer_version WHERE version=$1', [
      version,
    ]);
  },

  async migrateGetVersions(db) {
    await ensureMigrationTable(db);
    return await rawQuery(db, 'SELECT * FROM _fewer_version ORDER BY id ASC');
  },

  async migrateHasVersion(db, version) {
    await ensureMigrationTable(db);
    const versions = await rawQuery(db,
      'SELECT id FROM _fewer_version WHERE version=$1',
      [version],
    );
    return !!versions.length;
  },

  async migrate(db, direction, migration) {
    const query = migrate(migration);
    const results = await db.query(query);
    return results;
  }
});

// class PostgresAdapter implements BaseAdapter {
//   private client: Client;

//   // Expose the Table Types:
//   TableTypes!: TableTypes;

//   // Expose the Field Types:
//   FieldTypes = FieldTypes;

//   constructor(options: ConnectionConfig) {
//     this.client = new Client(options);
//   }

//   connect() {
//     return this.client.connect();
//   }

//   disconnect() {
//     return this.client.end();
//   }

//   private async ensureMigrationTable() {
//     await this.rawQuery(`CREATE TABLE IF NOT EXISTS _fewer_version (
//       id bigserial PRIMARY KEY,
//       version varchar UNIQUE
//     )`);
//   }

//   async migrateAddVersion(version: string) {
//     await this.ensureMigrationTable();
//     await this.rawQuery('INSERT INTO _fewer_version (version) VALUES ($1)', [
//       version,
//     ]);
//   }

//   async migrateRemoveVersion(version: string) {
//     await this.ensureMigrationTable();
//     await this.rawQuery('DELETE FROM _fewer_version WHERE version=$1', [
//       version,
//     ]);
//   }

//   async migrateGetVersions() {
//     await this.ensureMigrationTable();
//     return await this.rawQuery('SELECT * FROM _fewer_version ORDER BY id ASC');
//   }

//   async migrateHasVersion(version: string) {
//     await this.ensureMigrationTable();
//     const versions = await this.rawQuery(
//       'SELECT id FROM _fewer_version WHERE version=$1',
//       [version],
//     );
//     return !!versions.length;
//   }

//   async migrate(_direction: 'up' | 'down', migration: Migration) {
//     const query = migrate(migration);
//     const results = await this.client.query(query);
//     return results;
//   }

//   async select(query: Select) {
//     const context = query.get();
//     const select = squel.select().from(context.table);

//     if (context.limit) {
//       select.limit(context.limit);
//     }

//     if (context.offset) {
//       select.offset(context.offset);
//     }

//     for (const field of context.plucked) {
//       if (Array.isArray(field)) {
//         select.field(...field);
//       } else {
//         select.field(field);
//       }
//     }

//     for (const where of context.wheres) {
//       for (const [fieldName, matcher] of Object.entries(where)) {
//         if (Array.isArray(matcher)) {
//           select.where(`${fieldName} IN ?`, matcher);
//         } else {
//           select.where(`${fieldName} = ?`, matcher);
//         }
//       }
//     }

//     const results = await this.client.query(select.toString());
//     return results.rows;
//   }

//   async insert(query: Insert) {
//     const context = query.get();
//     const insert = squel
//       .insert()
//       .into(context.table)
//       .setFields(context.fields)
//       .returning('id');

//     const results = await this.client.query(insert.toString());
//     return results.rows;
//   }

//   async update(query: Update) {
//     const context = query.get();
//     const update = squel
//       .update()
//       .table(context.table)
//       .setFields(context.fields);

//     const results = await this.client.query(update.toString());
//     return results.rows;
//   }

//   async rawQuery(query: string, values?: any[]) {
//     const results = await this.client.query(query, values);
//     return results.rows;
//   }
// }
