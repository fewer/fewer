import { createDatabase, createMigration } from 'fewer';
import { Adapter, rawQuery } from '../';
import config from './config';

async function prepare() {
  const adapter = new Adapter({ ...config, database: 'postgres' });

  const pgDatabase = createDatabase({ adapter });

  const adapter2 = new Adapter({ ...config, database: 'fewer_typo_tests' });
  const database = createDatabase({ adapter: adapter2 });

  try {
    await pgDatabase.connect();
    await rawQuery(
      adapter.client!,
      'DROP DATABASE IF EXISTS fewer_typo_tests;',
    );
    await rawQuery(adapter.client!, 'CREATE DATABASE fewer_typo_tests;');

    await database.connect();

    const migration = createMigration(1, database, {
      change: (m, t) =>
        m
          .createTable(
            'users',
            { primaryKey: 'id' },
            {
              id: t.bigserial(),
              first_name: t.string(),
              last_name: t.string(),
            },
          )
          .createTable(
            'posts',
            { primaryKey: 'id' },
            {
              id: t.bigserial(),
              user_id: t.bigint(),
              title: t.string(),
              subtitle: t.string(),
            },
          ),
    });

    await migration.run('up');
  } catch (err) {
    console.log(err);
  }

  await database.disconnect();
  await pgDatabase.disconnect();
}

prepare();
